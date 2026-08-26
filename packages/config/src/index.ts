import { z } from "zod";

const nonNegativeUsd = (defaultValue: number) =>
  z.coerce.number().finite().nonnegative().default(defaultValue);

export const configSchema = z
  .object({
    DAILY_BUDGET_USD: nonNegativeUsd(1),
    MAX_COST_PER_RUN_USD: nonNegativeUsd(0.05),
    MAX_PROJECT_BUDGET_USD: nonNegativeUsd(5),
    DATABASE_PATH: z.string().min(1).default("data/pglite"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
  })
  .transform((config, context) => {
    if (config.MAX_COST_PER_RUN_USD > config.DAILY_BUDGET_USD) {
      context.addIssue({
        code: "custom",
        message: "MAX_COST_PER_RUN_USD must not exceed DAILY_BUDGET_USD",
        path: ["MAX_COST_PER_RUN_USD"],
      });
      return z.NEVER;
    }
    return config;
  });

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AppConfig {
  return configSchema.parse(environment);
}
