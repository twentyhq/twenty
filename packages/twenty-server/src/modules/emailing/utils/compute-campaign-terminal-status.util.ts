import { MessageCampaignStatus } from 'twenty-shared/types';

type CampaignMessageCounts = {
  totalCount: number;
  queuedCount: number;
  failedCount: number;
  skippedCount: number;
};

export const computeCampaignTerminalStatus = ({
  totalCount,
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

  // Every recipient was filtered out before a message was ever written, so nothing reached anyone
  // and reporting a clean send would be a lie.
  if (totalCount === 0) {
    return MessageCampaignStatus.SENT_WITH_ERRORS;
  }

  if (failedCount > 0 || skippedCount > 0) {
    return MessageCampaignStatus.SENT_WITH_ERRORS;
  }

  return MessageCampaignStatus.SENT;
};
