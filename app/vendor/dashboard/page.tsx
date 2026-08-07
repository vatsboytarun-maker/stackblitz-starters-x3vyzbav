import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorDashboardClient from "./VendorDashboardClient";

export default async function VendorDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/vendor/login");
  }

  const { data: capabilities } = await supabase
    .from("vendor_capability")
    .select("id, category")
    .eq("vendor_id", user.id);

  const categories = (capabilities || []).map((c) => c.category);

  const { data: requirements } = await supabase
    .from("requirements")
    .select("*")
    .eq("status", "active")
    .in("category", categories.length ? categories : ["__none__"])
    .order("created_at", { ascending: false });

  const reqIds = (requirements || []).map((r) => r.id);

  let quotes: any[] = [];
  if (reqIds.length > 0) {
    const { data } = await supabase
      .from("quotes")
      .select("id, requirement_id")
      .eq("vendor_id", user.id)
      .in("requirement_id", reqIds);
    quotes = data || [];
  }

  return (
    <VendorDashboardClient
      vendorId={user.id}
      capabilities={capabilities || []}
      requirements={requirements || []}
      quotedReqIds={quotes.map((q) => q.requirement_id)}
    />
  );
}
