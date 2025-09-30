const path = require('path');

const parseInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizeOrigins = originValue => {
    if (!originValue) return null;
    if (originValue === '*') return '*';
    return originValue
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
};

const loadConfig = (overrides = {}) => {
    const env = process.env.NODE_ENV || 'development';
    const baseDir = path.resolve(__dirname, '..', '..');
    const merged = {
        env,
        appName: process.env.APP_NAME || 'aurora-analytics',
        version: process.env.APP_VERSION || require(path.join(baseDir, 'package.json')).version,
        port: parseInteger(process.env.PORT, 3000),
        trustProxy: process.env.TRUST_PROXY === 'true' || parseInteger(process.env.TRUST_PROXY, 0) || false,
        corsOrigins: normalizeOrigins(process.env.CORS_ORIGIN),
        staticDir: path.resolve(process.env.STATIC_DIR || path.join(baseDir, 'public')),
        staticCacheSeconds: parseInteger(process.env.STATIC_CACHE_SECONDS, env === 'production' ? 31536000 : 0),
        bodySizeLimit: process.env.BODY_SIZE_LIMIT || '1mb',
        enableRequestLogging: process.env.REQUEST_LOGGING !== 'false',
        logLevel: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
        rateLimit: {
            windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
            max: parseInteger(process.env.RATE_LIMIT_MAX, 100)
        },
        leadStorePath: path.resolve(process.env.LEAD_STORE_PATH || path.join(baseDir, 'data', 'leads.json'))
    };

    const result = {
        ...merged,
        ...overrides,
        rateLimit: {
            ...merged.rateLimit,
            ...(overrides.rateLimit || {})
        }
    };

    return result;
};

module.exports = { loadConfig };
