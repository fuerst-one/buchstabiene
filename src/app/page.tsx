import { GameInterface } from "./GameInterface";
import { getTodaysGame } from "./getTodaysGame";

export default async function Home() {
  const { letters, possibleWords, timestamp } = await getTodaysGame();
  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground text-background">
      <div className="flex flex-col gap-6 container max-w-lg p-4">
        <h1 className="text-xl font-bold text-center w-full">
          Buchstabier-Biene
        </h1>
        <GameInterface
          letters={letters}
          possibleWords={possibleWords}
          timestamp={timestamp}
        />
      </div>
    </div>
  );
}
