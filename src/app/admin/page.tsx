import { adminGetWordVotes } from "@/server/api/wordVotes";
import { Downvotes } from "./Downvotes";

export default async function AdminPage() {
  const downvotes = await adminGetWordVotes();

  return (
    <>
      <h1>Admin</h1>
      <div className="flex w-full flex-col gap-4 px-2">
        <div className="w-full rounded-sm bg-white/10 px-2 py-1">
          <h2>Downvotes</h2>
          <Downvotes downvotes={downvotes} />
        </div>
      </div>
    </>
  );
}
