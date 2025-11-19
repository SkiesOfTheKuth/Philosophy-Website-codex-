const { getDefaultStore } = require('../storage/leadStore');

class LeadRepository {
    constructor(store = getDefaultStore()) {
        this.store = store;
    }

    createContact(record) {
        const data = this.store.read();
        data.contacts.push(record);
        this.store.write(data);
        return { ...record };
    }

    createNewsletterSubscription(record) {
        const data = this.store.read();
        data.newsletterSubscribers.push(record);
        this.store.write(data);
        return { ...record };
    }

    listContacts() {
        const data = this.store.read();
        return [...data.contacts];
    }

    listNewsletterSubscribers() {
        const data = this.store.read();
        return [...data.newsletterSubscribers];
    }

    reset() {
        this.store.reset();
    }
}

module.exports = {
    LeadRepository,
    defaultLeadRepository: new LeadRepository()
};
