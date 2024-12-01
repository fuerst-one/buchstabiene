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
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    const words = input
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0);
    await userAddWordVotes(words, 1);
    setShowSuggestionDialog(false);
  };

  return (
    <div className="mt-4 space-y-2 text-center">
      <p className="text-sm text-muted-foreground">
        Fehlt ein Wort in den Lösungen?
      </p>
      <Dialog
        open={showSuggestionDialog}
        onOpenChange={setShowSuggestionDialog}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-muted-foreground">
            Wörter vorschlagen
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wörter vorschlagen</DialogTitle>
          </DialogHeader>
          <p className="mb-2 text-sm text-muted-foreground">
            Fehlende Wörter können hier mit Komma getrennt vorgeschlagen werden.
          </p>
          <Input
            type="text"
            placeholder="Wörter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuggestionDialog(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={handleSubmit}>Vorschläge abschicken</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
