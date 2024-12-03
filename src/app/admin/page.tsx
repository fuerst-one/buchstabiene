import { adminGetWordVotes } from "@/server/api/wordVotes";
import { Downvotes } from "./Downvotes";
import { Suggestions } from "./Suggestions";
import { adminGetRandomGame } from "@/server/api/game";
import { GameSolutions } from "@/components/Game/GameSolutions";
import { gameDateString } from "@/lib/DateFormat";

export default async function AdminPage() {
  const wordVotes = await adminGetWordVotes();
  const suggestions = wordVotes.filter((vote) => vote.vote >= 0);
  const downvotes = wordVotes.filter((vote) => vote.vote < 0);
  const randomGame = await adminGetRandomGame();

  return (
    <>
      <h1>Admin</h1>
      {randomGame && (
        <GameSolutions
          date={gameDateString()}
          solutions={randomGame.possibleWords}
          isLoggedIn={false}
          savedGame={null}
          isAdmin={true}
          downvotes={downvotes.map((vote) => vote.word)}
        />
      )}
      <div className="mt-4 flex w-full flex-col gap-4 px-2">
        <div className="w-full rounded-sm bg-white/10 px-2 py-1">
          <h2>Downvotes</h2>
          <Downvotes downvotes={downvotes} />
        </div>
        <div className="w-full rounded-sm bg-white/10 px-2 py-1">
          <h2>Suggestions</h2>
          <Suggestions suggestions={suggestions} />
        </div>
      </div>
    </>
  );
}
