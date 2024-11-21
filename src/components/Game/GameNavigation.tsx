import dayjs from "@/dayjs";
import { DateFormat } from "@/lib/DateFormat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const GameNavigation = ({
  date,
  activeLink,
}: {
  date: string;
  activeLink: "game" | "highscores" | "loesungen";
}) => {
  const isToday = dayjs(date, DateFormat.date).isSame(dayjs(), "day");
  const dayBefore = dayjs(date, DateFormat.date)
    .subtract(1, "day")
    .format(DateFormat.date);
  const dayAfter = dayjs(date, DateFormat.date)
    .add(1, "day")
    .format(DateFormat.date);

  return (
    <div className="mb-4 space-y-2 text-center">
      <div className="flex justify-center gap-2">
        <Link href={`/spielen/${dayBefore}`}>
          <Button variant="outline">
            <ArrowLeft />
          </Button>
        </Link>
        <h2
          className={cn("flex items-center px-4", {
            "rounded-sm bg-yellow-500/30": isToday,
          })}
        >
          {date}
        </h2>
        <Link href={`/spielen/${dayAfter}`}>
          <Button variant="outline">
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
