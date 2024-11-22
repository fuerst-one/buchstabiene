import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(duration);

export const TimezoneDefault = "Europe/Berlin";

dayjs.tz.setDefault(TimezoneDefault);

export default dayjs;

export const dayjsTz = (...args: Parameters<typeof dayjs>) => {
  return dayjs(...args).tz(TimezoneDefault);
};
