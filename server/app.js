const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const contactRouter = require('./routes/contact');
const newsletterRouter = require('./routes/newsletter');
const healthRouter = require('./routes/health');
const { HttpError } = require('./utils/httpError');
const { loadConfig } = require('./config');
const LeadStore = require('./services/leadStore');
const { createLeadService } = require('./services/leadService');
const { createOptionalModule } = require('./utils/optionalModule');
const logger = require('./utils/logger');

const createRateLimiter = (config, rateLimitFactory) => rateLimitFactory({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many attempts detected. Please slow down and try again shortly.'
    }
});

const createApp = (options = {}) => {
    const config = loadConfig(options.config);
    const services = options.services || {};

    const leadService = services.leadService || createLeadService({
        store: new LeadStore(config.leadStorePath)
    });

    const app = express();
    app.set('config', config);
    app.set('leadService', leadService);
    app.set('startedAt', new Date().toISOString());

    if (config.trustProxy) {
        app.set('trust proxy', config.trustProxy);
    }

    app.disable('x-powered-by');

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        referrerPolicy: { policy: 'no-referrer-when-downgrade' }
    }));

    const optionalCompression = createOptionalModule('compression', {
        onFallback(error) {
            logger.warn(
                {
                    module: 'compression',
                    error: error && error.message
                },
                'HTTP compression module unavailable; falling back to no-op middleware'
            );
        }
    });
    const optionalHpp = createOptionalModule('hpp', {
        onFallback(error) {
            logger.warn(
                {
                    module: 'hpp',
                    error: error && error.message
                },
                'HTTP parameter pollution middleware unavailable; falling back to no-op middleware'
            );
        }
    });
    const optionalRateLimit = createOptionalModule('express-rate-limit', {
        onFallback(error) {
            logger.warn(
                {
                    module: 'express-rate-limit',
                    error: error && error.message
                },
                'Rate limiting module unavailable; API endpoints are currently unthrottled'
            );
        }
    });

    app.use(optionalHpp());
    app.use(optionalCompression());

    app.locals.dependencyHealth = {
        compression: {
            available: optionalCompression.isAvailable(),
            error: optionalCompression.loadError() ? optionalCompression.loadError().message : null
        },
        hpp: {
            available: optionalHpp.isAvailable(),
            error: optionalHpp.loadError() ? optionalHpp.loadError().message : null
        },
        rateLimit: {
            available: optionalRateLimit.isAvailable(),
            error: optionalRateLimit.loadError() ? optionalRateLimit.loadError().message : null
        }
    };

    if (config.corsOrigins === '*') {
        app.use(cors());
    } else if (Array.isArray(config.corsOrigins) && config.corsOrigins.length > 0) {
        app.use(cors({ origin: config.corsOrigins }));
    }

    if (config.enableRequestLogging && process.env.NODE_ENV !== 'test') {
        app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
    }

    app.use('/api', createRateLimiter(config, optionalRateLimit));

    app.use(express.json({ limit: config.bodySizeLimit }));
    app.use(express.urlencoded({ extended: false, limit: config.bodySizeLimit }));

    app.use('/api/health', healthRouter);
    app.use('/api/contact', contactRouter);
    app.use('/api/newsletter', newsletterRouter);
    app.use('/api', (req, res, next) => {
        next(new HttpError(404, 'Not found'));
    });

    const staticDir = config.staticDir;
    const staticOptions = {
        maxAge: config.staticCacheSeconds * 1000,
        setHeaders(res, filePath) {
            if (filePath.endsWith('index.html')) {
                res.setHeader('Cache-Control', 'no-store, max-age=0');
            }
        }
    };

    app.use(express.static(staticDir, staticOptions));

    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            res.status(404).json({ status: 'error', message: 'Not found' });
            return;
        }
        res.sendFile(path.join(staticDir, 'index.html'));
    });

    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        const status = err.status || 500;
        const response = {
            status: 'error',
            message: status >= 500 ? 'Something went wrong on our end.' : err.message
        };

        if (err.details) {
            response.errors = err.details;
        }

        if (status >= 500) {
            logger.error({ err, status }, 'Unhandled error bubbled to Express error middleware');
        }

        if (res.headersSent) {
            return;
        }

        res.status(status).json(response);
    });

    return app;
};

module.exports = createApp;
