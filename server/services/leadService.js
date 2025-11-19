const { randomUUID } = require('crypto');
const { defaultLeadRepository } = require('../repositories/leadRepository');

const createIdentifier = (length) => {
    const id = randomUUID().replace(/-/g, '');
    return length ? id.slice(0, length) : id;
};

class LeadService {
    constructor(repository = defaultLeadRepository) {
        this.repository = repository;
    }

    createContact(payload) {
        const record = {
            id: createIdentifier(12),
            receivedAt: new Date().toISOString(),
            ...payload
        };

        return this.repository.createContact(record);
    }

    createNewsletterSubscription(payload) {
        const record = {
            id: createIdentifier(10),
            receivedAt: new Date().toISOString(),
            ...payload
        };

        return this.repository.createNewsletterSubscription(record);
    }

    listContacts() {
        return this.repository.listContacts();
    }

    listNewsletterSubscribers() {
        return this.repository.listNewsletterSubscribers();
    }

    reset() {
        this.repository.reset();
    }
}

module.exports = new LeadService();
module.exports.createLeadService = (repository) => new LeadService(repository);
