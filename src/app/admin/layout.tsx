import { useServerAuth } from "@/zustand/useServerAuth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await useServerAuth.getState().getSession();

  if (!session?.user.isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}
