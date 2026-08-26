import pino, { type DestinationStream, type LoggerOptions } from "pino";

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "*.apiKey",
      "*.api_key",
      "*.authorization",
      "*.password",
      "apiKey",
      "api_key",
      "authorization",
      "password",
    ],
    censor: "[REDACTED]",
  },
};

export function createLogger(
  traceId: string,
  destination?: DestinationStream,
) {
  const logger = destination
    ? pino(options, destination)
    : pino(options, pino.destination(1));
  return logger.child({ trace_id: traceId });
}

export const logger = createLogger("bootstrap");
