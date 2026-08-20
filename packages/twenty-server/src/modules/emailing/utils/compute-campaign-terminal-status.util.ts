import { MessageCampaignStatus } from 'twenty-shared/types';

type CampaignMessageCounts = {
  queuedCount: number;
  failedCount: number;
  skippedCount: number;
};

export const computeCampaignTerminalStatus = ({
  queuedCount,
  failedCount,
  skippedCount,
}: CampaignMessageCounts):
  | MessageCampaignStatus.SENT
  | MessageCampaignStatus.SENT_WITH_ERRORS
  | undefined => {
  if (queuedCount > 0) {
    return undefined;
  }

  if (failedCount > 0 || skippedCount > 0) {
    return MessageCampaignStatus.SENT_WITH_ERRORS;
  }

  return MessageCampaignStatus.SENT;
};
