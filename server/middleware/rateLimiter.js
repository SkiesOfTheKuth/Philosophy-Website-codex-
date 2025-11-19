const DEFAULT_KEY_GENERATOR = (req) => req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'global';

const clampToSeconds = (timestamp) => Math.ceil(timestamp / 1000);

const createRateLimiter = ({ windowMs, max, keyGenerator = DEFAULT_KEY_GENERATOR }) => {
    if (!Number.isInteger(windowMs) || windowMs <= 0) {
        throw new Error('windowMs must be a positive integer.');
    }

    if (!Number.isInteger(max) || max <= 0) {
        throw new Error('max must be a positive integer.');
    }

    const hits = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key = keyGenerator(req);
        const windowStart = now - windowMs;

        const recentHits = (hits.get(key) || []).filter(timestamp => timestamp > windowStart);

        if (recentHits.length === 0) {
            hits.delete(key);
        }

        if (recentHits.length >= max) {
            const retryAfterMs = recentHits[0] + windowMs - now;
            const retryAfterSeconds = Math.max(1, clampToSeconds(retryAfterMs));
            const resetAt = clampToSeconds(recentHits[0] + windowMs);

            res.setHeader('X-RateLimit-Limit', String(max));
            res.setHeader('X-RateLimit-Remaining', '0');
            res.setHeader('X-RateLimit-Reset', String(resetAt));
            res.setHeader('Retry-After', String(retryAfterSeconds));

            res.status(429).json({
                status: 'error',
                message: 'Too many requests. Please wait before retrying.'
            });
            return;
        }

        recentHits.push(now);
        hits.set(key, recentHits);

        const resetAt = clampToSeconds(recentHits[0] + windowMs);
        const remaining = Math.max(0, max - recentHits.length);

        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(resetAt));
        next();
    };
};

module.exports = { createRateLimiter };
