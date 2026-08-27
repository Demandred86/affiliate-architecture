import { z } from "zod";
export declare const configSchema: z.ZodPipe<z.ZodObject<{
    DAILY_BUDGET_USD: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    MAX_COST_PER_RUN_USD: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    MAX_PROJECT_BUDGET_USD: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DATABASE_PATH: z.ZodString;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        debug: "debug";
        error: "error";
        fatal: "fatal";
        info: "info";
        silent: "silent";
        trace: "trace";
        warn: "warn";
    }>>;
}, z.core.$strip>, z.ZodTransform<{
    DAILY_BUDGET_USD: number;
    MAX_COST_PER_RUN_USD: number;
    MAX_PROJECT_BUDGET_USD: number;
    DATABASE_PATH: string;
    LOG_LEVEL: "debug" | "error" | "fatal" | "info" | "silent" | "trace" | "warn";
}, {
    DAILY_BUDGET_USD: number;
    MAX_COST_PER_RUN_USD: number;
    MAX_PROJECT_BUDGET_USD: number;
    DATABASE_PATH: string;
    LOG_LEVEL: "debug" | "error" | "fatal" | "info" | "silent" | "trace" | "warn";
}>>;
export type AppConfig = z.infer<typeof configSchema>;
export declare function defaultDatabasePath(environment?: NodeJS.ProcessEnv): string;
export declare function loadConfig(environment?: NodeJS.ProcessEnv): AppConfig;
//# sourceMappingURL=index.d.ts.map