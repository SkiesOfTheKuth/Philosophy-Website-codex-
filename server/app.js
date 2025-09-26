const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const contactRouter = require('./routes/contact');
const newsletterRouter = require('./routes/newsletter');
const healthRouter = require('./routes/health');
const { HttpError } = require('./utils/httpError');

const app = express();

app.disable('x-powered-by');

app.use(helmet({
    contentSecurityPolicy: false
}));

const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
    : null;

if (corsOrigins && corsOrigins.length > 0) {
    app.use(cors({ origin: corsOrigins }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

app.use('/api/health', healthRouter);
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api', (req, res, next) => {
    next(new HttpError(404, 'Not found'));
});

const staticDir = process.env.STATIC_DIR
    ? path.resolve(process.env.STATIC_DIR)
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

module.exports = app;
