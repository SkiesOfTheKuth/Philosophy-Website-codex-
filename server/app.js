const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const contactRouter = require('./routes/contact');
const newsletterRouter = require('./routes/newsletter');
const healthRouter = require('./routes/health');
const { HttpError } = require('./utils/httpError');
const baseConfig = require('./config');
const { createRateLimiter } = require('./middleware/rateLimiter');

const mergeConfig = (overrides = {}) => ({
    ...baseConfig,
    ...overrides,
    cors: {
        origins: overrides.cors?.origins ?? baseConfig.cors.origins
    },
    rateLimit: {
        enabled: overrides.rateLimit?.enabled ?? baseConfig.rateLimit.enabled,
        windowMs: overrides.rateLimit?.windowMs ?? baseConfig.rateLimit.windowMs,
        max: overrides.rateLimit?.max ?? baseConfig.rateLimit.max
    }
});

const createApp = (overrides = {}) => {
    const config = mergeConfig(overrides);
    const app = express();

    app.disable('x-powered-by');

    app.use(helmet({
        contentSecurityPolicy: false
    }));

    if (config.cors.origins.length > 0) {
        app.use(cors({ origin: config.cors.origins }));
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    if (config.env !== 'test') {
        app.use(morgan('combined'));
    }

    if (config.rateLimit.enabled) {
        const leadCaptureLimiter = createRateLimiter({
            windowMs: config.rateLimit.windowMs,
            max: config.rateLimit.max
        });

        app.use('/api/contact', leadCaptureLimiter);
        app.use('/api/newsletter', leadCaptureLimiter);
    }

    app.use('/api/health', healthRouter);
    app.use('/api/contact', contactRouter);
    app.use('/api/newsletter', newsletterRouter);
    app.use('/api', (req, res, next) => {
        next(new HttpError(404, 'Not found'));
    });

    const staticDir = config.staticDir
        ? path.resolve(config.staticDir)
        : path.resolve(__dirname, '..', 'public');

    app.use(express.static(staticDir));

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
            console.error(err);
        }

        if (res.headersSent) {
            return;
        }

        res.status(status).json(response);
    });

    return app;
};

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
