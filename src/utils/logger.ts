// importing modules
import pino from "pino";
import dayjs from "dayjs";
import config from "config";

// logger initialization
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
  base: {
    pid: false,
  },
  level: config.get<string>("log_level"),
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default logger;
