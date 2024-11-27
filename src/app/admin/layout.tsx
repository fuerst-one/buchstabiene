import { serverAdminGuard } from "@/zustand/useServerAuth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await serverAdminGuard();
  } catch {
    redirect("/");
  }

  return <>{children}</>;
}
