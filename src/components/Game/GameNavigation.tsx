import dayjs from "@/dayjs";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { GLOBAL_CONFIG } from "@/config";

export const GameNavigation = ({
  date,
  activeLink,
  isRevealed,
}: {
  date: string;
  activeLink: "game" | "highscores" | "loesungen";
  isRevealed?: boolean;
}) => {
  const isToday = dayjs(date, DateFormat.date)
    .tz(TimezoneDefault)
    .isSame(dayjs().tz(TimezoneDefault), "day");

  const dayBefore = dayjs(date, DateFormat.date)
    .tz(TimezoneDefault)
    .startOf("day")
    .subtract(1, "day")
    .format(DateFormat.date);

  const dayAfter = dayjs(date, DateFormat.date)
    .tz(TimezoneDefault)
    .startOf("day")
    .add(1, "day")
    .format(DateFormat.date);

  const isDayBeforeValid = !dayjs(dayBefore).isBefore(
    dayjs(GLOBAL_CONFIG.firstGameDate),
  );
  const isDayAfterValid = !dayjs(dayAfter).isAfter(dayjs());
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
          {date} {isRevealed && <Lock />}
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
          href={`/spielen/${date}`}
          className={cn({ underline: activeLink === "game" })}
        >
          Spiel
        </Link>{" "}
        /{" "}
        <Link
          href={`/spielen/${date}/highscores`}
          className={cn({ underline: activeLink === "highscores" })}
        >
          Highscores
        </Link>{" "}
        /{" "}
        <Link
          href={`/spielen/${date}/loesungen`}
          className={cn({ underline: activeLink === "loesungen" })}
        >
          Lösungen
        </Link>
      </div>
    </div>
  );
};
