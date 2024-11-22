import { dayjsTz } from "@/dayjs";
import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { GLOBAL_CONFIG } from "@/config";

export const GameNavigation = ({
  dateString,
  activeLink,
  isRevealed,
}: {
  dateString: string;
  activeLink: "game" | "highscores" | "loesungen";
  isRevealed?: boolean;
}) => {
  const isToday = gameDateDate(dateString).isSame(dayjsTz(), "day");

  const dayBefore = gameDateString(gameDateDate(dateString).subtract(1, "day"));
  const isDayBeforeValid = !gameDateDate(dayBefore).isBefore(
    gameDateDate(GLOBAL_CONFIG.firstGameDate),
  );

  const dayAfter = gameDateString(gameDateDate(dateString).add(1, "day"));
  const isDayAfterValid = !gameDateDate(dayAfter).isAfter(dayjsTz());

  const arrowLinkTarget = `${activeLink === "game" ? "" : `/${activeLink}`}`;

  return (
    <div className="mb-4 space-y-2 text-center">
      <div className="flex justify-center gap-2">
        <Link
          href={`/spielen/${dayBefore}${arrowLinkTarget}`}
          className={cn({ "pointer-events-none": !isDayBeforeValid })}
        >
          <Button variant="outline" disabled={!isDayBeforeValid}>
            <ArrowLeft />
          </Button>
        </Link>
        <h2
          className={cn("flex items-center px-4", {
            "rounded-sm bg-yellow-500/30": isToday,
          })}
        >
          {dateString} {isRevealed && <Lock />}
        </h2>
        <Link
          href={`/spielen/${dayAfter}${arrowLinkTarget}`}
          className={cn({ "pointer-events-none": !isDayAfterValid })}
        >
          <Button variant="outline" disabled={!isDayAfterValid}>
            <ArrowRight />
          </Button>
        </Link>
      </div>
      <div>
        <Link
          href={`/spielen/${dateString}`}
          className={cn({ underline: activeLink === "game" })}
        >
          Spiel
        </Link>{" "}
        /{" "}
        <Link
          href={`/spielen/${dateString}/highscores`}
          className={cn({ underline: activeLink === "highscores" })}
        >
          Highscores
        </Link>{" "}
        /{" "}
        <Link
          href={`/spielen/${dateString}/loesungen`}
          className={cn({ underline: activeLink === "loesungen" })}
        >
          Lösungen
        </Link>
      </div>
    </div>
  );
};
