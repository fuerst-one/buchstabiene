"use client";
import { adminDeleteWordFromGames } from "@/server/api/dictionaryAmendments";
import { userAddWordVotes, WordVote } from "@/server/api/wordVotes";
import { AmendmentList, getWordVotesWithCount } from "./AmendmentList";

export const Downvotes = ({ downvotes }: { downvotes: WordVote[] }) => {
  const downvotesByWord = getWordVotesWithCount(downvotes);
  return (
    <AmendmentList
      wordVotes={downvotesByWord}
      label="Downvotes"
      onSubmitSelected={adminDeleteWordFromGames}
      onAddWordVotes={(words) => userAddWordVotes(words, -1)}
    />
  );
};
