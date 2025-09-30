const defaultFallback = () => (req, res, next) => next();

const createOptionalModule = (moduleName, options = {}) => {
    const { fallback = defaultFallback, onFallback } = options;

    let moduleImplementation;
    let loadAttempted = false;
    let loadError;
    let notified = false;

    const load = () => {
        if (loadAttempted) {
            return;
        }

        loadAttempted = true;

        try {
            // eslint-disable-next-line global-require, import/no-dynamic-require
            moduleImplementation = require(moduleName);
        } catch (error) {
            loadError = error;
            if (onFallback && !notified) {
                notified = true;
                onFallback(error);
            }
        }
    };

    const proxy = (...args) => {
        load();
        const implementation = moduleImplementation || fallback;
        return typeof implementation === 'function' ? implementation(...args) : implementation;
    };

    proxy.isAvailable = () => {
        load();
        return Boolean(moduleImplementation);
    };

    proxy.loadError = () => {
        load();
        return loadError || null;
    };

    return proxy;
};

module.exports = { createOptionalModule };
