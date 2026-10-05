import { isNonEmptyString } from '@sniptt/guards';

import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK } from 'src/modules/emailing/constants/campaign-engagement-capture-rate-limit-per-link.constant';
import { CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_REQUESTER } from 'src/modules/emailing/constants/campaign-engagement-capture-rate-limit-per-requester.constant';

type CampaignEngagementThrottleLimit = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

export const getCampaignEngagementThrottleLimits = ({
  payload,
  requesterIp,
}: {
  payload: CampaignTrackingTokenPayload;
  requesterIp: string | null;
}): CampaignEngagementThrottleLimit[] => [
  ...(isNonEmptyString(requesterIp)
    ? [
        {
          key: `campaign-engagement:requester:${requesterIp}`,
          ...CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_REQUESTER,
        },
      ]
    : []),
  {
    key: `campaign-engagement:${payload.deliveryId}:${payload.shortLinkId}`,
    ...CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK,
  },
];
