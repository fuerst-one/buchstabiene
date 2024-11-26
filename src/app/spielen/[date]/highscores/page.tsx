import { GameNavigation } from "@/components/Game/GameNavigation";
import { Highscores } from "@/components/Game/Highscores";
import { getTotalScore, getWinningScore } from "@/components/Game/utils";
import { dayjsTz } from "@/dayjs";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";
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
  const { date: dateString } = await params;

  if (!dayjsTz(dateString).isValid()) {
    redirect(`/spielen/${gameDateString()}`);
  }

  const gameData = await getGameByDate(dateString);

  if (gameDateDate(dateString).startOf("day").isAfter(dayjsTz()) || !gameData) {
    return (
      <>
        <GameNavigation dateString={dateString} activeLink="highscores" />
        <div className="w-full rounded-sm bg-white/10 p-2">
          <p className="text-center">Spiel ist noch nicht verfügbar</p>
        </div>
      </>
    );
  }

  const user = (await useServerAuth.getState().getSession())?.user ?? null;
  const highscores = await getHighscoresByDate(dateString);

  return (
    <>
      <GameNavigation dateString={dateString} activeLink="highscores" />
      <Suspense fallback={<div>Lädt...</div>}>
        <Highscores
          user={user}
          highscores={highscores}
          winningScore={getWinningScore(gameData.possibleWords)}
          completedScore={getTotalScore(gameData.possibleWords)}
        />
      </Suspense>
    </>
  );
}
