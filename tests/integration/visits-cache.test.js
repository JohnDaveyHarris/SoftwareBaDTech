const request = require('supertest');
const { setupTestApp } = require('./helpers');

describe('Visits: cache', () => {
  let pgContainer, redisContainer, app, router;

  beforeEach(async () => {
    ({ app, router, pgContainer, redisContainer } = await setupTestApp());
  }, 60000);

  afterEach(async () => {
    if (router) await router.close();
    if (pgContainer) await pgContainer.stop();
    if (redisContainer) await redisContainer.stop();
  }, 30000);

  test('second request within TTL is served from cache', async () => {
    const first = await request(app).get('/visits');
    expect(first.body.source).toBe('db');

    const second = await request(app).get('/visits');
    expect(second.statusCode).toBe(200);
    expect(second.body.source).toBe('cache');
    expect(second.body.count).toBe(first.body.count);
  });
});