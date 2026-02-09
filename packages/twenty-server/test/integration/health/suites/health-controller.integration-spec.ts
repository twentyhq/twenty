import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

const HEALTHZ_SECRET = 'integration-test-healthz-secret';

describe('HealthController (integration)', () => {
  describe('GET /healthz', () => {
    it('should return 200 without requiring a secret', async () => {
      await client
        .get('/healthz')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('GET /healthz/:indicatorId', () => {
    it('should return 403 when X-Healthz-Secret header is missing', async () => {
      await client.get('/healthz/database').expect(403);
    });

    it('should return 403 when X-Healthz-Secret header has wrong value', async () => {
      await client
        .get('/healthz/database')
        .set('X-Healthz-Secret', 'wrong-secret')
        .expect(403);
    });

    it('should return 400 for invalid indicator id with valid secret', async () => {
      await client
        .get('/healthz/invalid-indicator')
        .set('X-Healthz-Secret', HEALTHZ_SECRET)
        .expect(400);
    });

    it('should return 200 for database indicator with valid secret', async () => {
      await client
        .get('/healthz/database')
        .set('X-Healthz-Secret', HEALTHZ_SECRET)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.info).toBeDefined();
          expect(res.body.info.database).toBeDefined();
        });
    });

    it('should return 200 for redis indicator with valid secret', async () => {
      await client
        .get('/healthz/redis')
        .set('X-Healthz-Secret', HEALTHZ_SECRET)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.info).toBeDefined();
          expect(res.body.info.redis).toBeDefined();
        });
    });

    it('should return 200 for billing indicator with billing disabled', async () => {
      await client
        .get('/healthz/billing')
        .set('X-Healthz-Secret', HEALTHZ_SECRET)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.info.billing).toBeDefined();
          expect(res.body.info.billing.status).toBe('up');
          expect(res.body.info.billing.details.status).toBe('disabled');
          expect(res.body.info.billing.details.message).toBe(
            'Billing is not enabled on this instance',
          );
        });
    });
  });
});
