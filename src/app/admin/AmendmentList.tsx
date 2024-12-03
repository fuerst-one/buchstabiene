"use client";
import { WordVoteDialog } from "@/components/Game/WordSuggestions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WordVote } from "@/server/api/wordVotes";
import { DictionaryAmendment } from "@/server/db/schema";
import { useState } from "react";

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
  onSubmitSelected,
  onAddWordVotes,
}: {
  wordVotes: WordVoteWithCount[];
  label: string;
  onSubmitSelected: (words: string[]) => Promise<DictionaryAmendment>;
  onAddWordVotes: (words: string[]) => Promise<boolean | void>;
}) => {
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const toggleSelectedWord = (word: string) => {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  };

  const addSelectedWords = async () => {
    const amendment = await onSubmitSelected(selectedWords);
    console.log(amendment);
    setSelectedWords([]);
  };

  const addWordVotes = async (words: string[]) => {
    await onAddWordVotes(words);
    setShowSuggestionDialog(false);
  };

  return (
    <div className="my-1 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
      {wordVotes.length ? (
        <div className="flex flex-col gap-0.5">
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
              onClick={() => setSelectedWords([])}
            >
              Deselect All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setSelectedWords(wordVotes.map(({ word }) => word))
              }
            >
              Select All
            </Button>
            <Button size="sm" onClick={addSelectedWords}>
              Commit {label}
            </Button>
          </div>
        </div>
      ) : (
        <p>No {label} found</p>
      )}
    </div>
  );
};
