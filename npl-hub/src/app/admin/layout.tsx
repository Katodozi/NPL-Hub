import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin-login");

  return (
    <div className="min-h-screen flex flex-col bg-npl-surface dark:bg-npl-surface">
      <AdminNav userEmail={user.email ?? ""} />
      <main className="flex-1 section-container py-8">{children}</main>
    </div>
  );
}
