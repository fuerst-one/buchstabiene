import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function LoginPage() {
  const session = await auth();
  console.log("session", session);

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Loggen Sie sich mit Ihren Anmeldedaten ein.
          </CardDescription>
        </CardHeader>
        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", formData);
          }}
        >
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="E-Mail"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Passwort"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit">
              Login
            </Button>
            <div className="flex flex-col gap-2 text-center text-sm">
              <Link
                href="/forgot-password"
                className="block text-blue-500 hover:underline"
              >
                Passwort vergessen?
              </Link>
              <span>
                Kein Konto?{" "}
                <Link href="/signup" className="text-blue-500 hover:underline">
                  Registrieren
                </Link>
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
