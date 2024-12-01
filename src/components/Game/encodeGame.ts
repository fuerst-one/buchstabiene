import { GameData } from "@/server/api/game";

export const encodeGameData = (gameData: GameData) => {
  return Buffer.from(JSON.stringify(gameData)).toString("base64");
};

export const decodeGameData = (encodedGameData: string) => {
  return JSON.parse(Buffer.from(encodedGameData, "base64").toString("utf-8"));
};
