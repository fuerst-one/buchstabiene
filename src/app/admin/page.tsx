import { adminGetWordVotes } from "@/server/api/wordVotes";
import { Downvotes } from "./Downvotes";
import { Suggestions } from "./Suggestions";

export default async function AdminPage() {
  const wordVotes = await adminGetWordVotes();
  const suggestions = wordVotes.filter((vote) => vote.vote >= 0);
  const downvotes = wordVotes.filter((vote) => vote.vote < 0);

  return (
    <>
      <h1>Admin</h1>
      <div className="flex w-full flex-col gap-4 px-2">
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
