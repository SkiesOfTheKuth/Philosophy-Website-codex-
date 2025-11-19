const fs = require('fs');
const path = require('path');
const config = require('../config');

const defaultState = () => ({
    contacts: [],
    newsletterSubscribers: []
});

const normalizePath = (targetPath) => targetPath.startsWith('file:')
    ? targetPath.slice(5)
    : targetPath;

const ensureDirectory = (targetPath) => {
    const directory = path.dirname(targetPath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

class LeadStore {
    constructor(filePath = config.database.url) {
        const normalized = normalizePath(filePath);
        this.memoryOnly = normalized === ':memory:' || normalized === 'memory:';

        if (!this.memoryOnly) {
            this.filePath = path.isAbsolute(normalized)
                ? normalized
                : path.resolve(process.cwd(), normalized);

            ensureDirectory(this.filePath);

            if (!fs.existsSync(this.filePath)) {
                fs.writeFileSync(this.filePath, JSON.stringify(defaultState(), null, 2));
            }
        } else {
            this.state = defaultState();
        }
    }

    read() {
        if (this.memoryOnly) {
            return { ...this.state, contacts: [...this.state.contacts], newsletterSubscribers: [...this.state.newsletterSubscribers] };
        }

        const raw = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(raw);
    }

    write(data) {
        if (this.memoryOnly) {
            this.state = {
                contacts: [...data.contacts],
                newsletterSubscribers: [...data.newsletterSubscribers]
            };
            return;
        }

        const payload = JSON.stringify(data, null, 2);
        const tempPath = `${this.filePath}.tmp`;
        fs.writeFileSync(tempPath, payload);
        fs.renameSync(tempPath, this.filePath);
    }

    reset() {
        this.write(defaultState());
    }
}

let defaultStore;

const getDefaultStore = () => {
    if (!defaultStore) {
        defaultStore = new LeadStore();
    }
    return defaultStore;
};

module.exports = {
    LeadStore,
    getDefaultStore,
    defaultState
};
