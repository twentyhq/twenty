import { isNonEmptyString } from '@sniptt/guards';

import { CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK } from 'src/modules/emailing/constants/campaign-engagement-capture-rate-limit-per-link.constant';
import { CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_REQUESTER } from 'src/modules/emailing/constants/campaign-engagement-capture-rate-limit-per-requester.constant';
import { type CampaignEngagement } from 'src/modules/emailing/types/campaign-engagement.type';

type CampaignEngagementThrottleLimit = {
  key: string;
  maxRequests: number;
  windowMs: number;
};

export const getCampaignEngagementThrottleLimits = ({
  engagement,
  requesterIp,
}: {
  engagement: CampaignEngagement;
  requesterIp: string | null;
}): CampaignEngagementThrottleLimit[] => {
  switch (engagement.type) {
    case 'CLICK':
      return [
        ...(isNonEmptyString(requesterIp)
          ? [
              {
                key: `campaign-engagement:requester:${requesterIp}`,
                ...CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_REQUESTER,
              },
            ]
          : []),
        {
          key: `campaign-engagement:${engagement.deliveryId}:${engagement.shortLinkId}`,
          ...CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK,
        },
      ];
    case 'OPEN':
      return [
        {
          key: `campaign-engagement:${engagement.deliveryId}:open`,
          ...CAMPAIGN_ENGAGEMENT_CAPTURE_RATE_LIMIT_PER_LINK,
        },
      ];
  }
};
