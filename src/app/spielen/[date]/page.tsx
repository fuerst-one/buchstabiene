import { Game } from "@/components/Game/Game";
import { GameNavigation } from "@/components/Game/GameNavigation";
import dayjs from "@/dayjs";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { getGameByDate } from "@/server/api/game";
import { useServerAuth } from "@/zustand/useServerAuth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Cache for 1 day
export const revalidate = 86400;
export const dynamicParams = true;

export default async function GameByDate({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!date || date === "heute" || !dayjs(date).isValid()) {
    redirect(`/spielen/${dayjs().tz(TimezoneDefault).format(DateFormat.date)}`);
  }

  const gameData = await getGameByDate(date);

  if (
    dayjs(date, DateFormat.date)
      .tz(TimezoneDefault)
      .startOf("day")
      .isAfter(dayjs()) ||
    !gameData
  ) {
    return (
      <>
        <GameNavigation date={date} activeLink="game" />
        <div className="w-full rounded-sm bg-white/10 p-2">
          <p className="text-center">Spiel ist noch nicht verfügbar</p>
        </div>
      </>
    );
  }

  const user = (await useServerAuth.getState().getSession())?.user ?? null;

  return (
    <>
      <GameNavigation date={date} activeLink="game" />
      <Suspense fallback={<div>Lädt...</div>}>
        <Game user={user} gameData={gameData} />
      </Suspense>
    </>
  );
}
