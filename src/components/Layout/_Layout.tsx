import { useServerAuth } from "@/zustand/useServerAuth";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export const _Layout = async ({ children }: { children: ReactNode }) => {
  const user = (await useServerAuth.getState().getSession())?.user ?? null;

  return (
    <div className="flex min-h-screen flex-col justify-stretch">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4 py-2">
        <Link href="/">
          <h1 className="text-2xl font-bold">BuchstaBiene</h1>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden text-sm lg:inline">
                Eingeloggt als {user.name}
              </div>
              <Link href="/logout">
                <Button variant="outline" size="sm">
                  Logout
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="container mx-auto flex h-full flex-col items-center justify-center py-6 md:py-12">
        {children}
      </div>
    </div>
  );
};
