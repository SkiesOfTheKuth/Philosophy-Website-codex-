const fs = require('fs/promises');
const path = require('path');

const INITIAL_STATE = Object.freeze({
    contacts: [],
    newsletterSubscribers: []
});

class LeadStore {
    constructor(filePath) {
        if (!filePath) {
            throw new Error('LeadStore requires a file path');
        }
        this.filePath = filePath;
        this.ready = this.ensureStore();
        this.writeQueue = Promise.resolve();
    }

    async ensureStore() {
        const directory = path.dirname(this.filePath);
        await fs.mkdir(directory, { recursive: true });

        try {
            await fs.access(this.filePath);
        } catch (error) {
            await fs.writeFile(this.filePath, JSON.stringify(INITIAL_STATE, null, 2), 'utf8');
        }
    }

    async readState() {
        await this.ready;
        try {
            const contents = await fs.readFile(this.filePath, 'utf8');
            if (!contents) return { ...INITIAL_STATE };
            const parsed = JSON.parse(contents);
            return {
                contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
                newsletterSubscribers: Array.isArray(parsed.newsletterSubscribers) ? parsed.newsletterSubscribers : []
            };
        } catch (error) {
            await this.writeState({ ...INITIAL_STATE });
            return { ...INITIAL_STATE };
        }
    }

    async writeState(nextState) {
        await this.ready;
        await fs.writeFile(this.filePath, JSON.stringify(nextState, null, 2), 'utf8');
    }

    async queueWrite(operation) {
        this.writeQueue = this.writeQueue.then(() => operation());
        try {
            return await this.writeQueue;
        } catch (error) {
            this.writeQueue = Promise.resolve();
            throw error;
        }
    }

    async saveContact(record) {
        return this.queueWrite(async () => {
            const state = await this.readState();
            state.contacts = [record, ...state.contacts];
            await this.writeState(state);
            return record;
        });
    }

    async saveNewsletterSubscriber(record) {
        return this.queueWrite(async () => {
            const state = await this.readState();
            state.newsletterSubscribers = [record, ...state.newsletterSubscribers];
            await this.writeState(state);
            return record;
        });
    }

    async listContacts() {
        const state = await this.readState();
        return [...state.contacts];
    }

    async listNewsletterSubscribers() {
        const state = await this.readState();
        return [...state.newsletterSubscribers];
    }

    async reset() {
        await this.queueWrite(async () => {
            await this.writeState({ ...INITIAL_STATE });
        });
    }
}

module.exports = LeadStore;
