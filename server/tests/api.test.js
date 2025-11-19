process.env.DATABASE_URL = ':memory:';

const request = require('supertest');
const { createApp } = require('../app');
const leadService = require('../services/leadService');

const app = createApp();

describe('Aurora Analytics API', () => {
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

            const contacts = leadService.listContacts();
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
                    id: expect.any(String)
                }
            });

            const subscribers = leadService.listNewsletterSubscribers();
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
    });

    it('exposes a health endpoint', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });
});
