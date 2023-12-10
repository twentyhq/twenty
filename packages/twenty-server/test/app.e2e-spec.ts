import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import { createApp } from './utils/create-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    [app] = await createApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/healthz (GET)', () => {
    return request(app.getHttpServer())
      .get('/healthz')
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          info: { database: { status: 'up' } },
          error: {},
          details: { database: { status: 'up' } },
        });
      });
  });
});
