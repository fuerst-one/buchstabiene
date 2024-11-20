import { NextResponse } from "next/server";
import { getTodaysGame } from "../getTodaysGame";

export const GET = async () => {
  const game = await getTodaysGame();
  return NextResponse.json(game);
};
