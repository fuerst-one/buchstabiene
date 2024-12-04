import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Info, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { AmendmentEffect } from "@/server/api/dictionaryAmendments";
import { DateFormat } from "@/lib/DateFormat";
import dayjs from "dayjs";
import { capitalize } from "@/lib/utils";

export const DialogAmendments = ({
  amendments,
  amendmentsDismissedAt,
  open,
  onOpenChange,
}: {
  amendments: AmendmentEffect[];
  amendmentsDismissedAt: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const filteredAmendments = useMemo(() => {
    return amendments.filter(
      (amendment) =>
        !amendmentsDismissedAt || amendment.createdAt > amendmentsDismissedAt,
    );
  }, [amendments, amendmentsDismissedAt]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <Info className="relative -top-0.5 mr-2 inline size-5" />
            Neue Wortschatz-Änderungen
          </DialogTitle>
        </DialogHeader>
        <p>
          An diesem Spiel wurden seit Deinem letzten Aufruf folgende
          Wortschatz-Änderungen vorgenommen:
        </p>
        <ul className="list-outside list-disc pl-5">
          {filteredAmendments.map((amendment) => (
            <li key={amendment.amendmentId} className="space-y-2">
              <p className="font-bold">
                {dayjs(amendment.appliedAt).format(DateFormat.dateDisplay)}
              </p>
              {amendment.wordsAdded.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <Plus className="relative mr-1 inline size-4" />
                  Diesem Spiel wurden Wörter hinzugefügt.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                <Minus className="relative mr-1 inline size-4" />
                Diese Wörter wurden entfernt:
              </p>
              <p className="block rounded-sm border px-2 py-1 text-sm">
                {amendment.wordsRemoved.map(capitalize).join(", ")}
              </p>
            </li>
          ))}
        </ul>
        {filteredAmendments.some(
          (amendment) => amendment.wordsAdded.length > 0,
        ) && (
          <p className="text-sm text-muted-foreground">
            Um dem Sinn des Spiels treu zu bleiben, werden neu hinzugefügte
            Wörter nicht angezeigt.
          </p>
        )}
        <DialogFooter>
          <Button type="submit" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
