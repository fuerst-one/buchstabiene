import { Game } from "@/components/Game/Game";
import { GameNavigation } from "@/components/Game/GameNavigation";
import { dayjsTz } from "@/dayjs";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { userGetWordVotes } from "@/server/api/wordVotes";
import { publicGetGameByDate } from "@/server/api/game";
import { getServerSessionUser } from "@/zustand/useServerAuth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Cache for 1 day
export const revalidate = 86400;
export const dynamicParams = true;

export default async function GameByDate({
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
        <GameNavigation dateString={dateString} activeLink="game" />
        <div className="w-full rounded-sm bg-white/10 p-2">
          <p className="text-center">Spiel ist noch nicht verfügbar</p>
        </div>
      </>
    );
  }

  const user = await getServerSessionUser();
  const downvotes = (await userGetWordVotes()).map((downvote) => downvote.word);

  return (
    <>
      <GameNavigation dateString={dateString} activeLink="game" />
      <Suspense fallback={<div>Lädt...</div>}>
        <Game user={user} gameData={gameData} downvotes={downvotes} />
      </Suspense>
    </>
  );
}
