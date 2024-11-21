import { GameNavigation } from "@/components/Game/GameNavigation";
import { Solutions } from "@/components/Game/Solutions";
import dayjs from "@/dayjs";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { getGameByDate } from "@/server/api/game";
import { useServerAuth } from "@/zustand/useServerAuth";
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
      <GameNavigation date={date} activeLink="loesungen" />
      <Suspense fallback={<div>Lädt...</div>}>
        <Solutions user={user} gameId={gameId} possibleWords={possibleWords} />
      </Suspense>
    </>
  );
}
