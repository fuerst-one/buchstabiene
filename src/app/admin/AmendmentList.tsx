"use client";
import { WordVoteDialog } from "@/components/Game/WordSuggestions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WordVote } from "@/server/api/wordVotes";
import { SetStateAction, Dispatch, useState } from "react";

type WordVoteWithCount = {
  word: string;
  count: number;
  users: string[];
};

export const getWordVotesWithCount = (
  wordVotes: WordVote[],
): WordVoteWithCount[] => {
  return wordVotes
    .reduce((acc, vote) => {
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
    }, [] as WordVoteWithCount[])
    .sort((a, b) => b.count - a.count);
};

export const AmendmentList = ({
  wordVotes,
  label,
  selectedWords,
  onChangeSelectedWords,
  onAddWordVotes,
}: {
  wordVotes: WordVoteWithCount[];
  label: string;
  selectedWords: string[];
  onChangeSelectedWords: Dispatch<SetStateAction<string[]>>;
  onAddWordVotes: (words: string[]) => Promise<boolean | void>;
}) => {
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);

  const toggleSelectedWord = (word: string) => {
    onChangeSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  const addWordVotes = async (words: string[]) => {
    await onAddWordVotes(words);
    setShowSuggestionDialog(false);
  };

  return (
    <>
      <h2 className="mb-2 text-lg font-bold">
        {label} ({wordVotes.length})
      </h2>
      {wordVotes.length ? (
        <div className="flex flex-col gap-0.5">
          <div className="max-h-[500px] overflow-y-auto rounded-sm bg-white/10 px-2">
            {wordVotes.map(({ word, count, users }) => (
              <Label
                htmlFor={`word-${word}`}
                key={word}
                className="text-md flex cursor-pointer items-center justify-start gap-2"
              >
                <Checkbox
                  id={`word-${word}`}
                  checked={selectedWords.includes(word)}
                  onClick={() => toggleSelectedWord(word)}
                />
                <span className="w-6">{count}</span>
                <span className="w-32">&quot;{word}&quot;</span>
                <span className="w-full truncate">{users.join(", ")}</span>
              </Label>
            ))}
          </div>
          <div className="my-1 flex gap-2">
            <WordVoteDialog
              label={`Add ${label}`}
              submitLabel={`Create ${label}`}
              open={showSuggestionDialog}
              onOpenChange={setShowSuggestionDialog}
              onSubmit={addWordVotes}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChangeSelectedWords([])}
            >
              Deselect All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onChangeSelectedWords(wordVotes.map(({ word }) => word))
              }
            >
              Select All
            </Button>
          </div>
        </div>
      ) : (
        <p>No {label} found</p>
      )}
    </>
  );
};
