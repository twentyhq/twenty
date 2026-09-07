import { MessageCampaignStatus } from 'twenty-shared/types';

import { type CampaignCounts } from 'src/engine/core-modules/emailing-domain/types/campaign-counts.type';

export const computeCampaignTerminalStatus = ({
  totalCount,
  inProgressCount,
  failedCount,
  skippedCount,
}: Pick<
  CampaignCounts,
  'totalCount' | 'inProgressCount' | 'failedCount' | 'skippedCount'
>):
  | MessageCampaignStatus.SENT
  | MessageCampaignStatus.SENT_WITH_ERRORS
  | undefined => {
  if (inProgressCount > 0) {
    return undefined;
  }

  if (totalCount === 0) {
    return MessageCampaignStatus.SENT_WITH_ERRORS;
  }

  if (failedCount > 0 || skippedCount > 0) {
    return MessageCampaignStatus.SENT_WITH_ERRORS;
  }

  return MessageCampaignStatus.SENT;
};
