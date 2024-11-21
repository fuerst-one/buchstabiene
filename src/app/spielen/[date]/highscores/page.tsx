import { Highscores } from "@/components/Game/Highscores";
import dayjs from "@/dayjs";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { getHighscoresByDate } from "@/server/api/game";
import { useServerAuth } from "@/zustand/useServerAuth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Cache for 1 day
export const revalidate = 86400;
export const dynamicParams = true;

export default async function GameByDateSolution({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!date || date === "heute" || !dayjs(date).isValid()) {
    redirect(`/spielen/${dayjs().tz(TimezoneDefault).format(DateFormat.date)}`);
  }

  const user = (await useServerAuth.getState().getSession())?.user ?? null;

  const highscores = await getHighscoresByDate(date);

  return (
    <>
      <h2 className="mb-4 text-center">
        {date} - <Link href={`/spielen/${date}`}>Spiel</Link> /{" "}
        <Link href={`/spielen/${date}/highscores`} className="underline">
          Highscores
        </Link>{" "}
        / <Link href={`/spielen/${date}/loesungen`}>Lösungen</Link>
      </h2>
      <Suspense fallback={<div>Lädt...</div>}>
        <Highscores user={user} highscores={highscores} />
      </Suspense>
    </>
  );
}
