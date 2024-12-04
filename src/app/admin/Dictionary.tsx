"use client";
import { useMemo, useState } from "react";
import { getWordScore } from "@/components/Game/utils";
import { capitalize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { isPangram } from "@/components/Game/utils";
import { Button } from "@/components/ui/button";
import { userAddWordVotes } from "@/server/api/wordVotes";

export const Dictionary = ({
  pangrams,
  otherWords,
  downvotes,
}: {
  pangrams: string[];
  otherWords: string[];
  downvotes: string[];
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (word: string) => {
    if (selected.includes(word)) {
      setSelected((prev) => prev.filter((w) => w !== word));
    } else {
      setSelected((prev) => [...prev, word]);
    }
  };

  const addDownvotes = async (words: string[]) => {
    await userAddWordVotes(words, -1);
    setSelected([]);
  };

  return (
    <div className="w-full px-2">
      <div className="my-1 flex flex-col gap-2 overflow-y-auto rounded-sm bg-white/10 px-2 pb-3 pt-1">
        <h3 className="text-lg font-semibold">Pangrams ({pangrams.length})</h3>
        <WordList
          words={pangrams}
          downvotes={downvotes}
          selected={selected}
          onSelect={handleSelect}
        />
        <h3 className="mt-4 text-lg font-semibold">
          Other words ({otherWords.length})
        </h3>
        <WordList
          words={otherWords}
          downvotes={downvotes}
          selected={selected}
          onSelect={handleSelect}
        />
        <h3 className="mt-4 text-lg font-semibold">
          Selected words ({selected.length})
        </h3>
        <div className="flex gap-2">{selected.join(", ")}</div>
        <Button onClick={() => addDownvotes(selected)}>Add Downvotes</Button>
      </div>
    </div>
  );
};

const WordList = ({
  words,
  downvotes,
  selected,
  onSelect,
}: {
  words: string[];
  downvotes: string[];
  selected: string[];
  onSelect: (word: string) => void;
}) => {
  const wordsByFirstLetter = useMemo(() => {
    const wordsFiltered = words.filter((word) => !downvotes.includes(word));
    return wordsFiltered.reduce(
      (acc, word) => {
        const firstLetter = word[0].toLowerCase();
        acc[firstLetter] = [...(acc[firstLetter] || []), word];
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }, [words, downvotes]);

  return (
    <div className="max-h-[500px] overflow-y-auto rounded-sm bg-white/10 px-2">
      <div className="columns-2" style={{ columnFill: "balance" }}>
        {Object.entries(wordsByFirstLetter).map(([letter, words]) => (
          <div key={letter} className="mt-2 border-t border-white">
            <h3 className="mb-1 mt-2 text-2xl font-semibold">
              {letter.toUpperCase()}
            </h3>
            <div className="flex flex-col gap-1">
              {words.map((word) => (
                <div
                  key={word}
                  className={cn("whitespace-nowrap px-1 leading-7 text-white", {
                    "font-bold": isPangram(word),
                    "rounded-sm bg-yellow-500/30": selected.includes(word),
                  })}
                  onClick={() => onSelect(word)}
                >
                  <span>{capitalize(word)} </span>
                  <span className="text-white/50">({getWordScore(word)})</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
