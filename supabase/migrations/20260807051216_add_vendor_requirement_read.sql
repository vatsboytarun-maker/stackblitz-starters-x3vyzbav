/*
# Add vendor read access to active requirements

Vendors need to see active RFQs so they can submit quotes on them.
This adds a SELECT policy allowing any authenticated vendor to read
requirements with status 'active'. (The buyer's own SELECT policy
already covers the buyer side.)
*/

DROP POLICY IF EXISTS "vendors_select_active_requirements" ON requirements;
CREATE POLICY "vendors_select_active_requirements" ON requirements FOR SELECT
  TO authenticated USING (status = 'active');