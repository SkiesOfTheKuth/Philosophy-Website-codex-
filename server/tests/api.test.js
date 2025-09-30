const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const request = require('supertest');

const createApp = require('../app');
const LeadStore = require('../services/leadStore');
const { createLeadService } = require('../services/leadService');

const buildTestServer = async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aurora-leads-'));
    const storePath = path.join(tempDir, 'leads.json');
    const store = new LeadStore(storePath);
    const leadService = createLeadService({ store });
    const app = createApp({
        config: {
            enableRequestLogging: false,
            leadStorePath: storePath
        },
        services: { leadService }
    });

    return { app, leadService, tempDir };
};

describe('Aurora Analytics API', () => {
    let app;
    let leadService;
    let tempDir;

    beforeEach(async () => {
        const server = await buildTestServer();
        app = server.app;
        leadService = server.leadService;
        tempDir = server.tempDir;
    });

    afterEach(async () => {
        await leadService.reset();
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('POST /api/contact', () => {
        it('stores a valid contact request', async () => {
            const payload = {
                name: 'Jordan Fisher',
                email: 'jordan@lumenwave.com',
                company: 'LumenWave',
                message: 'We need help forecasting a multi-region rollout.'
            };

            const response = await request(app).post('/api/contact').send(payload);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                status: 'success',
                data: {
                    id: expect.any(String),
                    receivedAt: expect.any(String)
                }
            });

            const contacts = await leadService.listContacts();
            expect(contacts).toHaveLength(1);
            expect(contacts[0]).toMatchObject(payload);
        });

        it('rejects invalid submissions', async () => {
            const response = await request(app).post('/api/contact').send({});

            expect(response.status).toBe(422);
            expect(response.body).toMatchObject({
                status: 'error',
                errors: {
                    name: expect.any(Array),
                    email: expect.any(Array),
                    company: expect.any(Array),
                    message: expect.any(Array)
                }
            });
        });

        it('blocks obvious bot submissions via honeypot', async () => {
            const response = await request(app).post('/api/contact').send({
                name: 'Bot',
                email: 'bot@example.com',
                company: 'Automation',
                message: 'spam',
                website: 'http://spammy.site'
            });

            expect(response.status).toBe(422);
            expect(response.body.errors.website[0]).toContain('Spam');
        });
    });

    describe('POST /api/newsletter', () => {
        it('subscribes a valid email', async () => {
            const response = await request(app).post('/api/newsletter').send({
                email: 'revops@novaenterprises.com'
            });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                status: 'success',
                data: {
                    id: expect.any(String),
                    receivedAt: expect.any(String)
                }
            });

            const subscribers = await leadService.listNewsletterSubscribers();
            expect(subscribers).toHaveLength(1);
            expect(subscribers[0].email).toBe('revops@novaenterprises.com');
        });

        it('returns validation errors for malformed input', async () => {
            const response = await request(app).post('/api/newsletter').send({
                email: 'invalid-email'
            });

            expect(response.status).toBe(422);
            expect(response.body.errors.email[0]).toContain('valid');
        });

        it('blocks spam via honeypot field', async () => {
            const response = await request(app).post('/api/newsletter').send({
                email: 'sales@auroraan.ai',
                website: 'https://spammy.site'
            });

            expect(response.status).toBe(422);
            expect(response.body.errors.website[0]).toContain('Spam');
        });
    });

    it('exposes a detailed health endpoint', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            status: 'ok',
            service: expect.any(String),
            version: expect.any(String),
            environment: expect.any(String)
        });
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('timestamp');
    });
});
