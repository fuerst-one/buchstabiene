import { z } from "zod";

export const emailSchema = z
  .string({ required_error: "E-Mail ist erforderlich" })
  .min(1, "E-Mail ist erforderlich")
  .email("Ungültige E-Mail-Adresse");

export const usernameSchema = z
  .string({ required_error: "Benutzername ist erforderlich" })
  .min(1, "Benutzername ist erforderlich")
  .regex(
    /^[a-zA-Z0-9\.\-\_]+$/,
    "Nur Buchstaben, Zahlen, Punkte, Bindestriche und Unterstriche sind erlaubt",
  );

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(1, "Passwort ist erforderlich")
  .min(8, "Passwort muss länger als 8 Zeichen sein");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  passwordRepeat: passwordSchema,
});

export type SignupFormValues = z.infer<typeof signUpSchema>;
