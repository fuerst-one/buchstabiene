import { GameInterface } from "./GameInterface";
import { getTodaysGame } from "./getTodaysGame";

export default async function Home() {
  const { letters, possibleWords, timestamp } = getTodaysGame();
  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground text-background">
      <GameInterface
        letters={letters}
        possibleWords={possibleWords}
        timestamp={timestamp}
      />
    </div>
  );
}
