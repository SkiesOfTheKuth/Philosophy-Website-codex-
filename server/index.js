require('dotenv').config();
const createApp = require('./app');
const { loadConfig } = require('./config');
const logger = require('./utils/logger');

const config = loadConfig();
const app = createApp({ config });

const server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Aurora Analytics server listening');
});

server.on('error', error => {
    logger.error({ err: error }, 'HTTP server error encountered');
});

const shutdown = signal => {
    logger.warn({ signal }, 'Shutdown signal received, closing HTTP server');
    server.close(closeError => {
        if (closeError) {
            logger.error({ err: closeError }, 'Error while closing HTTP server during shutdown');
            process.exitCode = 1;
        }
        logger.info('HTTP server closed gracefully');
        process.exit();
    });

    setTimeout(() => {
        logger.error({ timeoutMs: 10000 }, 'Forced shutdown after timeout');
        process.exit(1);
    }, 10000).unref();
};

['SIGTERM', 'SIGINT'].forEach(signal => {
    process.on(signal, () => shutdown(signal));
});
