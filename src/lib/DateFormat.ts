import dayjs, { dayjsTz } from "@/dayjs";

export const DateFormat = {
  date: "YYYY-MM-DD",
  dateDisplay: "DD.MM.YYYY",
  dateTime: "YYYY-MM-DD HH:mm",
  dateTimeWithSeconds: "YYYY-MM-DD HH:mm:ss",
  dateTimeDisplay: "DD.MM.YYYY HH:mm",
};

export const gameDateString = (date?: dayjs.ConfigType) => {
  return dayjsTz(date).format(DateFormat.date);
};

export const gameDateDate = (date?: dayjs.ConfigType) => {
  return dayjsTz(date, DateFormat.date);
};
