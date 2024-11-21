import { Game } from "@/components/Game";
import dayjs from "@/dayjs";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";
import { getGameByDate } from "@/server/api/game";
import { useServerAuth } from "@/zustand/useServerAuth";
import { redirect } from "next/navigation";

// Cache for 1 day and pre-generate last 10 days
export const revalidate = 86400;
export const dynamicParams = true;
export async function generateStaticParams() {
  const dates = [];
  for (let i = 0; i < 11; i++) {
    const date = dayjs()
      .subtract(i, "days")
      .tz(TimezoneDefault)
      .format(DateFormat.date);
    dates.push(date);
  }
  return dates.map((date) => ({ date }));
}

export default async function GameByDate({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!date || date === "heute" || !dayjs(date).isValid()) {
    redirect(`/spielen/${dayjs().tz(TimezoneDefault).format(DateFormat.date)}`);
  }

  const user = (await useServerAuth.getState().getSession())?.user ?? null;

  const game = await getGameByDate(date);

  const todaysTitle = "buchstabiene"
    .split("")
    .map((letter) => (game.letters.includes(letter) ? "_" : letter))
    .join("");

  return (
    <div className="mt-12 flex items-center justify-center">
      <div className="container max-w-lg">
        <h1 className="text-2xl font-bold text-center w-full mb-6">
          {todaysTitle} <br />
        </h1>
        {user && (
          <div className="text-sm text-center w-full mb-6">
            <p>Eingeloggt als &quot;{user.name}&quot;</p>
          </div>
        )}
        <p className="text-sm text-center w-full mb-6">{date}</p>
        <Game user={user} {...game} />
      </div>
    </div>
  );
}
