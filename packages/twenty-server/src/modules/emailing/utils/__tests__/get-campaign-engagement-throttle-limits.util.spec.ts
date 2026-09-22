import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { getCampaignEngagementThrottleLimits } from 'src/modules/emailing/utils/get-campaign-engagement-throttle-limits.util';

const PAYLOAD: CampaignTrackingTokenPayload = {
  purpose: 'CLICK',
  deliveryId: '7b1b78df-f57c-4367-88ba-31b41e38ab91',
  shortLinkId: 'e589543a-287d-4a83-ae31-55f9ef6c1cb3',
};

describe('getCampaignEngagementThrottleLimits', () => {
  it('only limits the delivery-link when the requester IP is unavailable', () => {
    expect(
      getCampaignEngagementThrottleLimits({
        payload: PAYLOAD,
        requesterIp: null,
      }),
    ).toEqual([
      {
        key: `campaign-engagement:${PAYLOAD.deliveryId}:${PAYLOAD.shortLinkId}`,
        maxRequests: 60,
        windowMs: 60_000,
      },
    ]);
  });

  it('limits both requester and delivery-link when the IP is known', () => {
    expect(
      getCampaignEngagementThrottleLimits({
        payload: PAYLOAD,
        requesterIp: '192.0.2.1',
      }),
    ).toEqual([
      {
        key: 'campaign-engagement:requester:192.0.2.1',
        maxRequests: 600,
        windowMs: 60_000,
      },
      {
        key: `campaign-engagement:${PAYLOAD.deliveryId}:${PAYLOAD.shortLinkId}`,
        maxRequests: 60,
        windowMs: 60_000,
      },
    ]);
  });
});
