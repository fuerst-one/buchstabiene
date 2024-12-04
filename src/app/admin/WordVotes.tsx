"use client";
import { adminAddWordToGames } from "@/server/api/dictionaryAmendments";
import { adminDeleteWordFromGames } from "@/server/api/dictionaryAmendments";
import { AmendmentList } from "./AmendmentList";
import { getWordVotesWithCount } from "./AmendmentList";
import { userAddWordVotes, WordVote } from "@/server/api/wordVotes";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const WordVotes = ({
  suggestions,
  downvotes,
}: {
  suggestions: WordVote[];
  downvotes: WordVote[];
}) => {
  const suggestionsByWord = getWordVotesWithCount(suggestions);
  const downvotesByWord = getWordVotesWithCount(downvotes);

  const [selectedDownvotes, setSelectedDownvotes] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  const onCommit = async () => {
    await adminAddWordToGames(selectedSuggestions);
    await adminDeleteWordFromGames(selectedDownvotes);
  };

  return (
    <div className="mt-4 flex w-full flex-col gap-4 px-2">
      <div className="my-1 space-y-3 overflow-y-auto rounded-sm bg-white/10 px-2 py-1">
        <AmendmentList
          wordVotes={downvotesByWord}
          label="Downvotes"
          selectedWords={selectedDownvotes}
          onChangeSelectedWords={setSelectedDownvotes}
          onAddWordVotes={(words) => userAddWordVotes(words, -1)}
        />
        <AmendmentList
          wordVotes={suggestionsByWord}
          label="Suggestions"
          selectedWords={selectedSuggestions}
          onChangeSelectedWords={setSelectedSuggestions}
          onAddWordVotes={(words) => userAddWordVotes(words, 1)}
        />
        <Button className="my-1 w-full" onClick={onCommit}>
          Create Amendment
        </Button>
      </div>
    </div>
  );
};
