"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminAddWordToGames } from "@/server/api/dictionaryAmendments";
import { WordVote } from "@/server/api/wordVotes";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Suggestions = ({ suggestions }: { suggestions: WordVote[] }) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const suggestionsByWord = suggestions
    .reduce(
      (acc, vote) => {
        if (vote.vote < 0) {
          return acc;
        }
        const existing = acc.find(({ word }) => word === vote.word);
        if (existing) {
          existing.count += 1;
          existing.users.push(vote.user.name);
        } else {
          acc.push({
            word: vote.word,
            count: 1,
            users: [vote.user.name],
          });
        }
        return acc;
      },
      [] as { word: string; count: number; users: string[] }[],
    )
    .sort((a, b) => b.count - a.count);

  const toggleSelectedWord = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  const addSelectedWords = async () => {
    const deleted = await adminAddWordToGames(selectedWords);
    console.log(deleted);
    // setSelectedWords([]);
  };

  return (
    <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
      {suggestionsByWord.length ? (
        <>
          {suggestionsByWord.map(({ word, count, users }) => (
            <div
              key={word}
              className="flex cursor-pointer items-center justify-start gap-2"
              onClick={() => toggleSelectedWord(word)}
            >
              <span>
                <Plus
                  className={cn(
                    "size-3",
                    selectedWords.includes(word) && "text-green-500",
                  )}
                />
              </span>
              <span className="w-6">{count}</span>
              <span className="w-32">&quot;{word}&quot;</span>
              <span className="w-full truncate">{users.join(", ")}</span>
            </div>
          ))}
          <div className="mt-2 flex gap-2">
            <Button
              onClick={() =>
                setSelectedWords(suggestionsByWord.map(({ word }) => word))
              }
            >
              Select All
            </Button>
            <Button onClick={addSelectedWords}>Add selected</Button>
          </div>
        </>
      ) : (
        <p>No suggestions found</p>
      )}
    </div>
  );
};
