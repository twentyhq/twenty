import { type INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import request from 'supertest';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { CampaignTrackingController } from 'src/modules/emailing/controllers/campaign-tracking.controller';

const VALID_TOKEN = 'a'.repeat(72);
const DELIVERY_ID = '2b77d7dd-3144-4215-aea3-6ce557c60879';
const SHORT_LINK_ID = 'd0b045ba-2799-4dcb-8d9c-7f4d9674c4ee';
const WORKSPACE_ID = '9c7cb281-f776-479d-889b-c3fe1f05a36d';

describe('GET /emailing/c/:token', () => {
  let app: INestApplication;
  const verify = jest.fn();
  const findById = jest.fn();
  const findOneBy = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    verify.mockReturnValue({
      purpose: 'CLICK',
      deliveryId: DELIVERY_ID,
      shortLinkId: SHORT_LINK_ID,
    });
    findOneBy.mockResolvedValue({ id: DELIVERY_ID, workspaceId: WORKSPACE_ID });
    findById.mockResolvedValue({
      id: SHORT_LINK_ID,
      resolvedDestinationUrl: 'https://example.com/welcome',
    });

    const module = await Test.createTestingModule({
      controllers: [CampaignTrackingController],
      providers: [
        { provide: CampaignTrackingTokenService, useValue: { verify } },
        { provide: ShortLinkService, useValue: { findById } },
        {
          provide: getRepositoryToken(CampaignDeliveryEntity),
          useValue: { findOneBy },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects a malformed token', async () => {
    await request(app.getHttpServer()).get('/emailing/c/bad').expect(400);
    expect(verify).not.toHaveBeenCalled();
  });

  it('rejects a token with a bad signature', async () => {
    verify.mockReturnValue(null);

    await request(app.getHttpServer())
      .get(`/emailing/c/${VALID_TOKEN}`)
      .expect(400);
  });

  it('returns 404 when the delivery or workspace link is absent', async () => {
    findOneBy.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get(`/emailing/c/${VALID_TOKEN}`)
      .expect(404);

    findById.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get(`/emailing/c/${VALID_TOKEN}`)
      .expect(404);
  });

  it('redirects to the resolved destination without caching or referrer disclosure', async () => {
    const response = await request(app.getHttpServer())
      .get(`/emailing/c/${VALID_TOKEN}`)
      .expect(302);

    expect(findById).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      shortLinkId: SHORT_LINK_ID,
    });
    expect(response.headers.location).toBe('https://example.com/welcome');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it.each(['javascript:alert(1)', 'https://example.com/\r\nX-Injected: yes'])(
    'refuses an unsafe stored destination',
    async (resolvedDestinationUrl) => {
      findById.mockResolvedValue({ resolvedDestinationUrl });

      await request(app.getHttpServer())
        .get(`/emailing/c/${VALID_TOKEN}`)
        .expect(404);
    },
  );
});
