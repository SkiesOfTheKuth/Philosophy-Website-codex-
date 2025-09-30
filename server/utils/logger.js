const levels = ['debug', 'info', 'warn', 'error'];
const levelWeight = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};

const normalizeLevel = value => {
    if (!value) return null;
    const lower = String(value).toLowerCase();
    return levels.includes(lower) ? lower : null;
};

const getActiveLevel = () =>
    normalizeLevel(process.env.LOG_LEVEL) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const shouldLog = level => levelWeight[level] >= levelWeight[getActiveLevel()];

const buildPayload = (level, message, metadata) => {
    const payload = {
        level,
        time: new Date().toISOString(),
        msg: message
    };

    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
        const normalized = { ...metadata };
        if (normalized.err instanceof Error) {
            normalized.err = {
                message: normalized.err.message,
                stack: normalized.err.stack
            };
        }

        Object.assign(payload, normalized);
    }

    return payload;
};

const write = (level, metadataOrMessage, maybeMessage) => {
    if (!shouldLog(level)) {
        return;
    }

    let metadata = undefined;
    let message = metadataOrMessage;

    if (maybeMessage !== undefined) {
        metadata = metadataOrMessage;
        message = maybeMessage;
    }

    const payload = buildPayload(level, message, metadata);
    const line = JSON.stringify(payload);

    if (level === 'error') {
        console.error(line); // eslint-disable-line no-console
    } else if (level === 'warn') {
        console.warn(line); // eslint-disable-line no-console
    } else {
        console.log(line); // eslint-disable-line no-console
    }
};

module.exports = {
    debug(metadataOrMessage, maybeMessage) {
        write('debug', metadataOrMessage, maybeMessage);
    },
    info(metadataOrMessage, maybeMessage) {
        write('info', metadataOrMessage, maybeMessage);
    },
    warn(metadataOrMessage, maybeMessage) {
        write('warn', metadataOrMessage, maybeMessage);
    },
    error(metadataOrMessage, maybeMessage) {
        write('error', metadataOrMessage, maybeMessage);
    }
};
