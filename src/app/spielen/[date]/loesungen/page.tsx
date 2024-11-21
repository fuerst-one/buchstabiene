import { Solutions } from "@/components/Game/Solutions";
import dayjs from "@/dayjs";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { getGameByDate } from "@/server/api/game";
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

  const { gameId, possibleWords } = await getGameByDate(date);

  return (
    <>
      <h2 className="mb-4 text-center">
        {date} - <Link href={`/spielen/${date}`}>Spiel</Link> /{" "}
        <Link href={`/spielen/${date}/highscores`}>Highscores</Link> /{" "}
        <Link href={`/spielen/${date}/loesungen`} className="underline">
          Lösungen
        </Link>
      </h2>
      <Suspense fallback={<div>Lädt...</div>}>
        <Solutions user={user} gameId={gameId} possibleWords={possibleWords} />
      </Suspense>
    </>
  );
}
