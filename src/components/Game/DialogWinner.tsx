import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Star } from "lucide-react";
import { Button } from "../ui/button";

export const DialogWinner = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <Star className="relative -top-0.5 mr-2 inline size-5" />
            Spiel gewonnen!
          </DialogTitle>
        </DialogHeader>
        <p>
          Herzlichen Glückwunsch, du hast die höchste Stufe für heute erreicht.
          Du kannst trotzdem weiter Wörter suchen, Punkte sammeln und versuchen
          alle restlichen Wörter zu finden.
        </p>
        <DialogFooter>
          <Button type="submit" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
