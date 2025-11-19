process.env.DATABASE_URL = ':memory:';

const request = require('supertest');

const ORIGINAL_ENV = { ...process.env };

const buildTestApp = () => {
    const { createApp } = require('../app');
    return createApp({
        env: 'test',
        rateLimit: {
            enabled: true,
            windowMs: 2000,
            max: 2
        }
    });
};

describe('Rate limiting', () => {
    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    it('throttles repeated submissions from the same client', async () => {
        const app = buildTestApp();
        const payload = {
            name: 'Jordan Fisher',
            email: 'jordan@lumenwave.com',
            company: 'LumenWave',
            message: 'We need help forecasting a multi-region rollout.'
        };

        const first = await request(app).post('/api/contact').send(payload);
        const second = await request(app).post('/api/contact').send(payload);
        const blocked = await request(app).post('/api/contact').send(payload);

        expect(first.status).toBe(201);
        expect(second.status).toBe(201);
        expect(blocked.status).toBe(429);
        expect(blocked.headers['retry-after']).toBeDefined();
        expect(blocked.body).toMatchObject({
            status: 'error',
            message: expect.stringContaining('Too many requests')
        });
    });
});
