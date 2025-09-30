const { randomUUID } = require('crypto');

const generateId = (length = 12) =>
    randomUUID()
        .replace(/-/g, '')
        .slice(0, length);

const createLeadService = ({ store }) => {
    if (!store) {
        throw new Error('LeadService requires a store implementation');
    }

    const createRecord = (payload, length = 12) => ({
        id: generateId(length),
        receivedAt: new Date().toISOString(),
        ...payload
    });

    return {
        async createContact(payload) {
            const record = createRecord(payload, 12);
            await store.saveContact(record);
            return record;
        },

        async createNewsletterSubscription(payload) {
            const record = createRecord(payload, 10);
            await store.saveNewsletterSubscriber(record);
            return record;
        },

        async listContacts() {
            return store.listContacts();
        },

        async listNewsletterSubscribers() {
            return store.listNewsletterSubscribers();
        },

        async reset() {
            if (typeof store.reset === 'function') {
                await store.reset();
            }
        }
    };
};

module.exports = { createLeadService };
