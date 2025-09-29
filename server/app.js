const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const contactRouter = require('./routes/contact');
const newsletterRouter = require('./routes/newsletter');
const healthRouter = require('./routes/health');
const { HttpError } = require('./utils/httpError');
const { loadConfig } = require('./config');
const LeadStore = require('./services/leadStore');
const { createLeadService } = require('./services/leadService');

const createRateLimiter = config => rateLimit({
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

    app.use(hpp());
    app.use(compression());

    if (config.corsOrigins === '*') {
        app.use(cors());
    } else if (Array.isArray(config.corsOrigins) && config.corsOrigins.length > 0) {
        app.use(cors({ origin: config.corsOrigins }));
    }

    if (config.enableRequestLogging && process.env.NODE_ENV !== 'test') {
        app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
    }

    app.use('/api', createRateLimiter(config));

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
            console.error(err);
        }

        if (res.headersSent) {
            return;
        }

        res.status(status).json(response);
    });

    return app;
};

module.exports = createApp;
