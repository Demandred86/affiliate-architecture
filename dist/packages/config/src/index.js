import { z } from "zod";
import { homedir } from "node:os";
import { join } from "node:path";
const nonNegativeUsd = (defaultValue) => z.coerce.number().finite().nonnegative().default(defaultValue);
export const configSchema = z
    .object({
    DAILY_BUDGET_USD: nonNegativeUsd(1),
    MAX_COST_PER_RUN_USD: nonNegativeUsd(0.05),
    MAX_PROJECT_BUDGET_USD: nonNegativeUsd(5),
    DATABASE_PATH: z.string().min(1),
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
export function defaultDatabasePath(environment = process.env) {
    const dataHome = environment.LOCALAPPDATA ??
        environment.XDG_DATA_HOME ??
        join(homedir(), ".local", "share");
    return join(dataHome, "ase", "pglite");
}
export function loadConfig(environment = process.env) {
    return configSchema.parse({
        ...environment,
        DATABASE_PATH: environment.DATABASE_PATH ?? defaultDatabasePath(environment),
    });
}
//# sourceMappingURL=index.js.map