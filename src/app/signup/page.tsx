import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signUp } from "@/server/api/auth";
import { formDataToObject } from "@/lib/formDataToObject";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/zod/auth";

export default async function SignupPage() {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Registrierung</CardTitle>
          <CardDescription>
            Geben Sie Ihre Anmeldedaten ein, um ein Konto zu erstellen.
          </CardDescription>
        </CardHeader>
        <form
          action={async (formData) => {
            "use server";
            const formValues = await signUpSchema.parseAsync(
              formDataToObject(formData)
            );
            await signUp(formValues);
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
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  name="username"
                  type="username"
                  placeholder="Benutzername"
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
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="passwordRepeat">Passwort wiederholen</Label>
                <Input
                  id="passwordRepeat"
                  name="passwordRepeat"
                  type="password"
                  placeholder="Passwort wiederholen"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">
              Registrieren
            </Button>
            <div className="mt-4 space-y-2 text-center text-sm">
              <Link
                href="/login"
                className="block text-blue-500 hover:underline"
              >
                Bereits ein Konto?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
