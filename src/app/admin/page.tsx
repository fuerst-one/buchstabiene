import { adminGetDownvotes } from "@/server/api/downvotes";

export default async function AdminPage() {
  const downvotes = await adminGetDownvotes();

  const downvotesByWord = Object.entries(
    downvotes.reduce(
      (acc, downvote) => {
        acc[downvote.word] = (acc[downvote.word] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <h1>Admin</h1>
      <div className="flex w-full flex-col gap-4 px-2">
        <div className="w-full rounded-sm bg-white/10 px-2 py-1">
          <h2>Downvotes</h2>
          <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
            {downvotesByWord.length ? (
              downvotesByWord.map(({ word, count }) => (
                <div key={word} className="flex justify-between">
                  <p>{word}</p>
                  <p>{count}</p>
                </div>
              ))
            ) : (
              <p>No downvotes yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
