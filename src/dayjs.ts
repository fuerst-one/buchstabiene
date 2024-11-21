import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import { TimezoneDefault } from "./lib/DateFormat";
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(duration);

dayjs.tz.setDefault(TimezoneDefault);

export default dayjs;
