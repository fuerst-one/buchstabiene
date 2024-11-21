import dayjs from "@/dayjs";
import { Button } from "@/components/ui/button";
import { useServerAuth } from "@/zustand/useServerAuth";
import Link from "next/link";
import { DateFormat, TimezoneDefault } from "@/lib/DateFormat";

export default async function Home() {
  const user = (await useServerAuth.getState().getSession())?.user;

  return (
    <div className="mt-12 flex items-center justify-center">
      <div className="container max-w-lg">
        <h1 className="text-2xl font-bold text-center w-full mb-6">
          BuchstaBiene
        </h1>
        {user && (
          <div className="text-sm text-center w-full mb-6">
            <p>Eingeloggt als &quot;{user.name}&quot;</p>
          </div>
        )}
        <div className="flex flex-col justify-center items-center gap-4">
          <Link href="/spielen/heute">
            <Button variant="outline" size="lg">
              Heutiges Spiel
            </Button>
          </Link>
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <h2 className="text-lg font-bold">Letzte Spiele</h2>
            {Array.from({ length: 10 }).map((_, index) => (
              <Link
                key={index}
                href={`/spielen/${dayjs()
                  .tz(TimezoneDefault)
                  .subtract(index, "day")
                  .format(DateFormat.date)}`}
              >
                <Button variant="outline">
                  {dayjs()
                    .tz(TimezoneDefault)
                    .subtract(index, "day")
                    .format(DateFormat.date)}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
