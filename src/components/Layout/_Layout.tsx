import { useServerAuth } from "@/zustand/useServerAuth";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { LogoutButton } from "./LogoutButton";
import { Info } from "lucide-react";

export const _Layout = async ({ children }: { children: ReactNode }) => {
  const user = (await useServerAuth.getState().getSession())?.user ?? null;
  return (
    <div className="flex min-h-screen flex-col justify-stretch">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="BuchstaBiene" width={32} height={32} />
          <h1 className="text-2xl font-bold">BuchstaBiene</h1>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden text-sm lg:inline">
                Eingeloggt als {user.name}
              </div>
              <LogoutButton>Logout</LogoutButton>
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
      {!user && (
        <div className="mb-6 flex items-center justify-center gap-2 border-y border-white/10 bg-white/10 px-2 py-1 text-sm">
          <Info className="inline-block h-4 w-4" />
          <span>
            <span className="font-semibold">Info:</span> Um Spiele zu speichern,
            musst du dich registrieren.
          </span>
          <Link href="/signup">
            <Button variant="link" size="sm">
              Zur Registrierung
            </Button>
          </Link>
        </div>
      )}
      <div className="container mx-auto flex h-full max-w-screen-sm flex-col items-center justify-center py-6 md:py-12">
        {children}
      </div>
      <div className="flex items-center justify-center border-t border-white/10 px-4 py-4">
        <div className="text-center text-white/40">
          <div className="mb-2 text-sm">
            &copy; fuerst.one {new Date().getFullYear()}
          </div>
          <div className="text-xs">
            <Link href="https://portfolio.fuerst.one/impressum">Impressum</Link>
            {" - "}
            <Link href="https://portfolio.fuerst.one/datenschutz">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
