import { Test } from '@nestjs/testing';

import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { CampaignEngagementCaptureService } from 'src/modules/emailing/services/campaign-engagement-capture.service';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';

const PAYLOAD: CampaignTrackingTokenPayload = {
  purpose: 'CLICK',
  deliveryId: '7b1b78df-f57c-4367-88ba-31b41e38ab91',
  shortLinkId: 'e589543a-287d-4a83-ae31-55f9ef6c1cb3',
};

describe('CampaignEngagementCaptureService', () => {
  const add = jest.fn();
  const tokenBucketThrottleOrThrow = jest.fn();
  const incrementCounterBy = jest.fn();
  const isAvailable = jest.fn();
  let service: CampaignEngagementCaptureService;

  beforeEach(async () => {
    jest.clearAllMocks();
    isAvailable.mockReturnValue(true);

    const module = await Test.createTestingModule({
      providers: [
        CampaignEngagementCaptureService,
        {
          provide: getQueueToken(MessageQueue.campaignEngagementQueue),
          useValue: { add },
        },
        {
          provide: ThrottlerService,
          useValue: { tokenBucketThrottleOrThrow },
        },
        { provide: MetricsService, useValue: { incrementCounterBy } },
        { provide: CampaignEngagementEventService, useValue: { isAvailable } },
      ],
    }).compile();

    service = module.get(CampaignEngagementCaptureService);
  });

  it('does not enqueue when ClickHouse is unavailable', async () => {
    isAvailable.mockReturnValue(false);

    await service.capture({
      payload: PAYLOAD,
      userAgent: null,
      requesterIp: null,
    });

    expect(tokenBucketThrottleOrThrow).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
  });

  it('skips the requester bucket when the IP is absent', async () => {
    await service.capture({
      payload: PAYLOAD,
      userAgent: null,
      requesterIp: null,
    });

    expect(tokenBucketThrottleOrThrow).toHaveBeenCalledTimes(1);
    expect(tokenBucketThrottleOrThrow.mock.calls[0][0]).toBe(
      `campaign-engagement:${PAYLOAD.deliveryId}:${PAYLOAD.shortLinkId}`,
    );
    expect(add).toHaveBeenCalledTimes(1);
  });

  it('enforces requester and delivery-link buckets when the IP is known', async () => {
    await service.capture({
      payload: PAYLOAD,
      userAgent: 'Mozilla/5.0',
      requesterIp: '192.0.2.1',
    });

    expect(tokenBucketThrottleOrThrow.mock.calls.map(([key]) => key)).toEqual([
      'campaign-engagement:requester:192.0.2.1',
      `campaign-engagement:${PAYLOAD.deliveryId}:${PAYLOAD.shortLinkId}`,
    ]);
    expect(add).toHaveBeenCalledTimes(1);
  });

  it('drops a throttled observation without rejecting the redirect', async () => {
    tokenBucketThrottleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'rate limited',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    await expect(
      service.capture({ payload: PAYLOAD, userAgent: null, requesterIp: null }),
    ).resolves.toBeUndefined();

    expect(add).not.toHaveBeenCalled();
    expect(incrementCounterBy).toHaveBeenCalledTimes(1);
  });
});
