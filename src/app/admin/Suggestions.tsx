"use client";
import { adminAddWordToGames } from "@/server/api/dictionaryAmendments";
import { userAddWordVotes, WordVote } from "@/server/api/wordVotes";
import { AmendmentList } from "./AmendmentList";
import { getWordVotesWithCount } from "./AmendmentList";

export const Suggestions = ({ suggestions }: { suggestions: WordVote[] }) => {
  const suggestionsByWord = getWordVotesWithCount(suggestions);
  return (
    <AmendmentList
      wordVotes={suggestionsByWord}
      label="Suggestions"
      onSubmitSelected={adminAddWordToGames}
      onAddWordVotes={(words) => userAddWordVotes(words, 1)}
    />
  );
};
