import { gameDateDate, gameDateString } from "@/lib/DateFormat";
import { Dayjs } from "dayjs";

export const getGameTimestamp = (date: Dayjs) => {
  return Math.floor(gameDateDate(date).startOf("day").valueOf() / 1000);
};

export const getGameTimestampFromDate = (date: string) => {
  return getGameTimestamp(gameDateDate(date));
};

export const getGameIdFromData = ({
  letterSet,
  date,
}: {
  letterSet: string;
  date: string;
}) => {
  const timestamp = getGameTimestampFromDate(date);
  return Buffer.from(letterSet + timestamp).toString("base64");
};

export const getDataFromGameId = (gameId: string) => {
  const decoded = Buffer.from(gameId, "base64").toString("utf-8");
  const letterSet = decoded.slice(0, 7);
  const timestamp = gameDateString(Number(decoded.slice(7)) * 1000);
  return { letterSet, timestamp };
};
