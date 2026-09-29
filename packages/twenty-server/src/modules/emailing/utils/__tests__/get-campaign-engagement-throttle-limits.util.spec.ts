import { type CampaignEngagement } from 'src/modules/emailing/types/campaign-engagement.type';
import { getCampaignEngagementThrottleLimits } from 'src/modules/emailing/utils/get-campaign-engagement-throttle-limits.util';

const CLICK: CampaignEngagement = {
  type: 'CLICK',
  workspaceId: '4fe04fe4-dcd6-4123-bf05-ec8f989cda29',
  deliveryId: '7b1b78df-f57c-4367-88ba-31b41e38ab91',
  shortLinkId: 'e589543a-287d-4a83-ae31-55f9ef6c1cb3',
};

describe('getCampaignEngagementThrottleLimits', () => {
  it('only limits the delivery-link when the requester IP is unavailable', () => {
    expect(
      getCampaignEngagementThrottleLimits({
        engagement: CLICK,
        requesterIp: null,
      }),
    ).toEqual([
      {
        key: `campaign-engagement:${CLICK.deliveryId}:${CLICK.shortLinkId}`,
        maxRequests: 60,
        windowMs: 60_000,
      },
    ]);
  });

  it('limits both requester and delivery-link when the IP is known', () => {
    expect(
      getCampaignEngagementThrottleLimits({
        engagement: CLICK,
        requesterIp: '192.0.2.1',
      }),
    ).toEqual([
      {
        key: 'campaign-engagement:requester:192.0.2.1',
        maxRequests: 600,
        windowMs: 60_000,
      },
      {
        key: `campaign-engagement:${CLICK.deliveryId}:${CLICK.shortLinkId}`,
        maxRequests: 60,
        windowMs: 60_000,
      },
    ]);
  });

  it('limits the opens of a delivery apart from its link clicks', () => {
    expect(
      getCampaignEngagementThrottleLimits({
        engagement: {
          type: 'OPEN',
          workspaceId: CLICK.workspaceId,
          deliveryId: CLICK.deliveryId,
        },
        requesterIp: null,
      }),
    ).toEqual([
      {
        key: `campaign-engagement:${CLICK.deliveryId}:open`,
        maxRequests: 60,
        windowMs: 60_000,
      },
    ]);
  });
});
