import { signOut } from "@/auth";
import { Button, ButtonProps } from "../ui/button";

export const LogoutButton = (props: Omit<ButtonProps, "onClick">) => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button variant="outline" size="sm" {...props} />
    </form>
  );
};
