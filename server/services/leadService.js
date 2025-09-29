const { randomUUID } = require('crypto');

const createIdentifier = (length) => {
    const id = randomUUID().replace(/-/g, '');
    return length ? id.slice(0, length) : id;
};

class LeadService {
    constructor() {
        this.reset();
    }

    createContact(payload) {
        const record = {
            id: createIdentifier(12),
            receivedAt: new Date().toISOString(),
            ...payload
        };
        this.contacts.push(record);
        return record;
    }

    createNewsletterSubscription(payload) {
        const record = {
            id: createIdentifier(10),
            receivedAt: new Date().toISOString(),
            ...payload
        };
        this.newsletterSubscribers.push(record);
        return record;
    }

    listContacts() {
        return [...this.contacts];
    }

    listNewsletterSubscribers() {
        return [...this.newsletterSubscribers];
    }

    reset() {
        this.contacts = [];
        this.newsletterSubscribers = [];
    }
}

module.exports = new LeadService();
