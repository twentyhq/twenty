import { isDefined } from 'twenty-shared/utils';

import { SCANNER_PREFETCH_WINDOW_MS } from 'src/modules/emailing/constants/scanner-prefetch-window-ms.constant';
import { type CampaignEngagementActivityClass } from 'src/modules/emailing/types/campaign-engagement-activity-class.type';
import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

export const classifyCampaignOpen = ({
  sentAt,
  occurredAt,
  userAgent,
}: {
  sentAt: Date | null;
  occurredAt: string;
  userAgent: string | null;
}): CampaignEngagementActivityClass => {
  const userAgentClass = classifyEngagementUserAgent(userAgent);

  if (userAgentClass !== 'UNCLASSIFIED' || !isDefined(sentAt)) {
    return userAgentClass;
  }

  const millisecondsSinceSent =
    new Date(occurredAt).getTime() - new Date(sentAt).getTime();

  return millisecondsSinceSent < SCANNER_PREFETCH_WINDOW_MS
    ? 'SUSPECTED_AUTOMATION'
    : 'UNCLASSIFIED';
};
