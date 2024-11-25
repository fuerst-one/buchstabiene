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

export const DialogCompleted = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <Star className="relative -top-0.5 mr-2 inline size-5" />
            Wow, du hast alle Wörter gefunden!
          </DialogTitle>
        </DialogHeader>
        <p>
          Großen Respekt, du hast alle Wörter gefunden. Du bist für heute
          fertig.
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
