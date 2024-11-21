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

  if (dayjs(date).isAfter(dayjs())) {
    return <div>Spiel ist noch nicht verfügbar</div>;
  }

  const user = (await useServerAuth.getState().getSession())?.user ?? null;

  const game = await getGameByDate(date);

  return (
    <>
      <GameNavigation date={date} activeLink="game" />
      <Suspense fallback={<div>Lädt...</div>}>
        <Game user={user} {...game} />
      </Suspense>
    </>
  );
}
