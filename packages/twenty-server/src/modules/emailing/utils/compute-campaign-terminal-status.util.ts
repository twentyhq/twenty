import { MessageCampaignStatus } from 'twenty-shared/types';

type CampaignMessageCounts = {
  totalCount: number;
  inProgressCount: number;
  failedCount: number;
  skippedCount: number;
};

export const computeCampaignTerminalStatus = ({
  totalCount,
  inProgressCount,
  failedCount,
  skippedCount,
}: CampaignMessageCounts):
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
