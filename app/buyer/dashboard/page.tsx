import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BuyerDashboardClient from "./BuyerDashboardClient";

export default async function BuyerDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/buyer/new");
  }

  const { data: requirements } = await supabase
    .from("requirements")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const reqIds = (requirements || []).map((r) => r.id);

  let quotes: any[] = [];
  if (reqIds.length > 0) {
    const { data } = await supabase
      .from("quotes")
      .select("id, requirement_id, price, notes, status, created_at")
      .in("requirement_id", reqIds)
      .order("created_at", { ascending: false });
    quotes = data || [];
  }

  return (
    <BuyerDashboardClient
      requirements={requirements || []}
      quotes={quotes}
    />
  );
}
