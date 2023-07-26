import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import { AppModule } from 'src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
