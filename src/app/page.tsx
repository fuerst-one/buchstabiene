import { dayjsTz } from "@/dayjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { gameDateString } from "@/lib/DateFormat";
import { Calendar } from "@/components/ui/calendar";
import { getPlayedGames } from "@/server/api/game";
import { redirect } from "next/navigation";
import { GLOBAL_CONFIG } from "@/config";

export default async function Home() {
  const playedGames = await getPlayedGames();

  return (
    <div className="container flex h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <Link href="/spielen/heute">
          <Button variant="default" size="lg">
            Heutiges Spiel
          </Button>
        </Link>
        <div className="mt-4 flex flex-col items-center justify-center gap-2">
          <h2 className="text-lg font-bold">Letzte Spiele</h2>
          <Calendar
            selected={playedGames.map((date) =>
              dayjsTz(date.timestamp).toDate(),
            )}
            disabled={{
              before: dayjsTz(GLOBAL_CONFIG.firstGameDate).toDate(),
              after: dayjsTz().toDate(),
            }}
            onDayClick={async (date) => {
              "use server";
              redirect(`/spielen/${gameDateString(date)}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
