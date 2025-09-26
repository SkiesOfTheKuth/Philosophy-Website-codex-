const { nanoid } = require('nanoid');

class LeadService {
    constructor() {
        this.reset();
    }

    createContact(payload) {
        const record = {
            id: nanoid(12),
            receivedAt: new Date().toISOString(),
            ...payload
        };
        this.contacts.push(record);
        return record;
    }

    createNewsletterSubscription(payload) {
        const record = {
            id: nanoid(10),
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
