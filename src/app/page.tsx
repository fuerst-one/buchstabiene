import { GameInterface } from "./GameInterface";
import { getTodaysGame } from "./getTodaysGame";

export default async function Home() {
  const { letters, possibleWords } = getTodaysGame();
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <GameInterface letters={letters} possibleWords={possibleWords} />
    </div>
  );
}
