import { GameInterface } from "../components/GameInterface";
import { getTodaysGame } from "./getTodaysGame";

export default async function Home() {
  const { id, letters, possibleWords } = await getTodaysGame();
  const todaysTitle = "buchstabiene"
    .split("")
    .map((letter) => (letters.includes(letter) ? "_" : letter))
    .join("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground text-background">
      <div className="container max-w-lg">
        <h1 className="text-xl font-bold text-center w-full mb-6">
          {todaysTitle}
        </h1>
        <GameInterface
          id={id}
          letters={letters}
          possibleWords={possibleWords}
        />
      </div>
    </div>
  );
}
