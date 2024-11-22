import { gameDateString } from "@/lib/DateFormat";
import { redirect } from "next/navigation";

export default async function GameToday() {
  redirect(`/spielen/${gameDateString()}`);
}
