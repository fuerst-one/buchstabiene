import { adminGetWordVotes } from "@/server/api/wordVotes";
import { adminGetCurrentDictionary } from "@/server/api/game";
import { Dictionary } from "./Dictionary";
import { WordVotes } from "./WordVotes";

export default async function AdminPage() {
  const wordVotes = await adminGetWordVotes();
  const suggestions = wordVotes.filter((vote) => vote.vote >= 0);
  const downvotes = wordVotes.filter((vote) => vote.vote < 0);
  const { pangrams, otherWords } = await adminGetCurrentDictionary();

  return (
    <>
      <h1 className="text-2xl font-bold">Admin</h1>
      <Dictionary
        pangrams={pangrams}
        otherWords={otherWords}
        downvotes={downvotes.map((vote) => vote.word)}
      />
      <WordVotes suggestions={suggestions} downvotes={downvotes} />
    </>
  );
}
