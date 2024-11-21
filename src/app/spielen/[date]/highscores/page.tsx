import { GameNavigation } from "@/components/Game/GameNavigation";
import { Highscores } from "@/components/Game/Highscores";
import dayjs from "@/dayjs";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { getGameByDate, getHighscoresByDate } from "@/server/api/game";
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
  const game = await getGameByDate(date);
  const highscores = await getHighscoresByDate(date);

  return (
    <>
      <GameNavigation date={date} activeLink="highscores" />
      <Suspense fallback={<div>Lädt...</div>}>
        <Highscores
          user={user}
          highscores={highscores}
          maxScore={game.maxScore}
        />
      </Suspense>
    </>
  );
}
