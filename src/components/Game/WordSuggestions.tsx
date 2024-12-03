import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { userAddWordVotes } from "@/server/api/wordVotes";

export const WordSuggestions = () => {
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);

  const handleSubmit = async (words: string[]) => {
    await userAddWordVotes(words, 1);
    setShowSuggestionDialog(false);
  };

  return (
    <div className="mt-4 space-y-2 text-center">
      <p className="text-sm text-muted-foreground">
        Fehlt ein Wort in den Lösungen?
      </p>
      <WordVoteDialog
        label="Wörter vorschlagen"
        submitLabel="Vorschläge abschicken"
        buttonClassName="text-muted-foreground"
        open={showSuggestionDialog}
        onOpenChange={setShowSuggestionDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export const WordVoteDialog = ({
  label,
  submitLabel,
  buttonClassName,
  open,
  onOpenChange,
  onSubmit,
}: {
  label: string;
  submitLabel: string;
  buttonClassName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (words: string[]) => Promise<void>;
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    const words = input
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);
    await onSubmit(words);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={buttonClassName}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        <p className="mb-2 text-sm text-muted-foreground">
          Wörter können hier mit Komma getrennt vorgeschlagen werden.
        </p>
        <Input
          type="text"
          placeholder="Wörter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
