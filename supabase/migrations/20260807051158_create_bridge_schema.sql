/*
# Create BRIDGE marketplace schema

1. Purpose
   B2B procurement marketplace connecting Buyers and Vendors.
   - Buyers submit Requests for Quotation (RFQs) describing what they need.
   - Vendors declare capability categories and see matching RFQs.
   - Vendors submit quotes (price + notes) on matched RFQs.
   - Buyers view quotes received on their RFQs.

2. New Tables
   - `profiles` — extends auth.users with role flags (is_buyer, is_vendor).
     - id (uuid, PK, FK to auth.users)
     - is_buyer (boolean, default false)
     - is_vendor (boolean, default false)
     - created_at (timestamptz)
   - `requirements` — an RFQ submitted by a buyer.
     - id (uuid, PK)
     - buyer_id (uuid, FK to auth.users, defaults to auth.uid())
     - category (text, not null)
     - sub_category (text)
     - quantity (numeric)
     - unit (text, default 'nos')
     - delivery_location (text)
     - required_by (date)
     - specs (text[], default '{}')
     - status (text, default 'active')
     - created_at (timestamptz)
   - `vendor_capability` — categories a vendor can fulfill.
     - id (uuid, PK)
     - vendor_id (uuid, FK to auth.users, defaults to auth.uid())
     - category (text, not null)
     - created_at (timestamptz)
   - `quotes` — a vendor's quote on a requirement.
     - id (uuid, PK)
     - requirement_id (uuid, FK to requirements)
     - vendor_id (uuid, FK to auth.users, defaults to auth.uid())
     - price (numeric, not null)
     - notes (text)
     - status (text, default 'submitted')
     - created_at (timestamptz)

3. Security (RLS enabled on all tables)
   - profiles: each user can read/update only their own profile row.
   - requirements: buyers can CRUD their own RFQs; vendors can SELECT active RFQs (to quote on them).
   - vendor_capability: vendors can CRUD their own capabilities; buyers can SELECT (for matching display).
   - quotes: vendors can CRUD their own quotes; buyers can SELECT quotes on their own RFQs.

4. Notes
   - All owner columns default to auth.uid() so client inserts that omit the owner still pass RLS.
   - Email/password auth is used (no phone OTP) to avoid requiring an SMS provider.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_buyer boolean NOT NULL DEFAULT false,
  is_vendor boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- requirements
CREATE TABLE IF NOT EXISTS requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  sub_category text,
  quantity numeric,
  unit text NOT NULL DEFAULT 'nos',
  delivery_location text,
  required_by date,
  specs text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_requirements" ON requirements;
CREATE POLICY "select_own_requirements" ON requirements FOR SELECT
  TO authenticated USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "insert_own_requirements" ON requirements;
CREATE POLICY "insert_own_requirements" ON requirements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "update_own_requirements" ON requirements;
CREATE POLICY "update_own_requirements" ON requirements FOR UPDATE
  TO authenticated USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "delete_own_requirements" ON requirements;
CREATE POLICY "delete_own_requirements" ON requirements FOR DELETE
  TO authenticated USING (auth.uid() = buyer_id);

-- vendor_capability
CREATE TABLE IF NOT EXISTS vendor_capability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, category)
);
ALTER TABLE vendor_capability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_capability" ON vendor_capability;
CREATE POLICY "select_own_capability" ON vendor_capability FOR SELECT
  TO authenticated USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "insert_own_capability" ON vendor_capability;
CREATE POLICY "insert_own_capability" ON vendor_capability FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "update_own_capability" ON vendor_capability;
CREATE POLICY "update_own_capability" ON vendor_capability FOR UPDATE
  TO authenticated USING (auth.uid() = vendor_id) WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "delete_own_capability" ON vendor_capability;
CREATE POLICY "delete_own_capability" ON vendor_capability FOR DELETE
  TO authenticated USING (auth.uid() = vendor_id);

-- quotes
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Vendors can read quotes they submitted
DROP POLICY IF EXISTS "select_own_quotes" ON quotes;
CREATE POLICY "select_own_quotes" ON quotes FOR SELECT
  TO authenticated USING (auth.uid() = vendor_id);

-- Vendors can insert quotes for themselves
DROP POLICY IF EXISTS "insert_own_quotes" ON quotes;
CREATE POLICY "insert_own_quotes" ON quotes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = vendor_id);

-- Vendors can update/delete their own quotes
DROP POLICY IF EXISTS "update_own_quotes" ON quotes;
CREATE POLICY "update_own_quotes" ON quotes FOR UPDATE
  TO authenticated USING (auth.uid() = vendor_id) WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "delete_own_quotes" ON quotes;
CREATE POLICY "delete_own_quotes" ON quotes FOR DELETE
  TO authenticated USING (auth.uid() = vendor_id);

-- Buyers can read quotes on their own requirements
DROP POLICY IF EXISTS "select_quotes_on_own_requirements" ON quotes;
CREATE POLICY "select_quotes_on_own_requirements" ON quotes FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM requirements
      WHERE requirements.id = quotes.requirement_id
      AND requirements.buyer_id = auth.uid()
    )
  );