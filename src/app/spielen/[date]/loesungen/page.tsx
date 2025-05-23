import { GameNavigation } from "@/components/Game/GameNavigation";
import { GameSolutionsEncrypted } from "@/components/Game/GameSolutions";
import { dayjsTz } from "@/dayjs";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { userGetWordVotes } from "@/server/api/wordVotes";
import { publicGetGameByDate, userGetSavedGame } from "@/server/api/game";
import { getServerSessionUser } from "@/zustand/useServerAuth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { encryptSolutions } from "@/components/Game/encryptSolutions";

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

  const gameData = await publicGetGameByDate(dateString);

  if (gameDateDate(dateString).startOf("day").isAfter(dayjsTz()) || !gameData) {
    return (
      <>
        <GameNavigation dateString={dateString} activeLink="loesungen" />
        <div className="w-full rounded-sm bg-white/10 p-2">
          <p className="text-center">Spiel ist noch nicht verfügbar</p>
        </div>
      </>
    );
  }

  const solutionsEncrypted = await encryptSolutions(gameData.possibleWords);
  const user = await getServerSessionUser();
  const savedGame = await userGetSavedGame(dateString);
  const downvotes = (await userGetWordVotes())
    .filter((downvote) => gameData.possibleWords.includes(downvote.word))
    .filter((downvote) => downvote.vote < 0)
    .map((downvote) => downvote.word);

  return (
    <>
      <GameNavigation dateString={dateString} activeLink="loesungen" />
      <Suspense fallback={<div>Lädt...</div>}>
        <GameSolutionsEncrypted
          solutionsEncrypted={solutionsEncrypted}
          date={dateString}
          isLoggedIn={!!user}
          savedGame={savedGame}
          downvotes={downvotes}
        />
      </Suspense>
    </>
  );
}
