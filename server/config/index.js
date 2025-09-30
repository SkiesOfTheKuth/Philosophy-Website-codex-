const path = require('path');
const { z } = require('zod');

const coerceBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = value.trim().toLowerCase();

    if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
        return true;
    }

    if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
        return false;
    }

    throw new Error(`Invalid boolean value "${value}" for environment flag.`);
};

const parseOrigins = (value) => {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
};

const defaultDatabasePath = path.join(process.cwd(), 'data', 'leads.json');

const configSchema = z.object({
    env: z.enum(['development', 'test', 'production']).default('development'),
    port: z.coerce.number().int().positive().default(3000),
    staticDir: z.string().trim().min(1).optional(),
    corsOrigins: z.array(z.string().trim().min(1)).default([]),
    rateLimitEnabled: z.boolean(),
    rateLimitWindowMs: z.coerce.number().int().positive().default(60_000),
    rateLimitMax: z.coerce.number().int().positive().default(10),
    databaseUrl: z.string().trim().min(1).default(defaultDatabasePath)
});

const parsed = configSchema.parse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    staticDir: process.env.STATIC_DIR,
    corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
    rateLimitEnabled: coerceBoolean(process.env.RATE_LIMIT_ENABLED, true),
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: process.env.RATE_LIMIT_MAX,
    databaseUrl: process.env.DATABASE_URL
});

const config = {
    env: parsed.env,
    port: parsed.port,
    staticDir: parsed.staticDir,
    cors: {
        origins: parsed.corsOrigins
    },
    rateLimit: {
        enabled: parsed.rateLimitEnabled,
        windowMs: parsed.rateLimitWindowMs,
        max: parsed.rateLimitMax
    },
    database: {
        url: parsed.databaseUrl
    }
};

module.exports = Object.freeze(config);
