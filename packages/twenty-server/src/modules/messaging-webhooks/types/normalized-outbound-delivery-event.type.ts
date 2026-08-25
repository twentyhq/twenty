import { type MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type CampaignProviderOutcome } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';

export type NormalizedOutboundDeliveryEvent = {
  workspaceId: string;
  outcome: CampaignProviderOutcome;
  suppression: {
    reason:
      | MessageSuppressionReason.BOUNCE
      | MessageSuppressionReason.COMPLAINT;
    emailAddresses: string[];
  } | null;
  providerMessageId: string | null;
  providerEventId: string | null;
  dedupeKey: string;
};
