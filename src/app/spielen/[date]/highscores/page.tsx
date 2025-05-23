import { GameNavigation } from "@/components/Game/GameNavigation";
import { GameHighscores } from "@/components/Game/GameHighscores";
import { getTotalScore, getWinningScore } from "@/components/Game/utils";
import { dayjsTz } from "@/dayjs";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { publicGetGameByDate } from "@/server/api/game";
import { publicGetHighscoresByDate } from "@/server/api/highscores";
import { getServerSessionUser } from "@/zustand/useServerAuth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Cache for 1 day
export const revalidate = 86400;
export const dynamicParams = true;

export default async function GameByDateHighscores({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date: dateString } = await params;

  if (!dayjsTz(dateString).isValid()) {
    redirect(`/spielen/${gameDateString()}`);
  }

  const gameData = await publicGetGameByDate(dateString);

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

  const { possibleWords } = gameData;
  const user = await getServerSessionUser();
  const highscores = await publicGetHighscoresByDate(dateString);

  return (
    <>
      <GameNavigation dateString={dateString} activeLink="highscores" />
      <Suspense fallback={<div>Lädt...</div>}>
        <GameHighscores
          username={user?.name}
          highscores={highscores}
          winningScore={getWinningScore(possibleWords)}
          completedScore={getTotalScore(possibleWords)}
        />
      </Suspense>
    </>
  );
}
