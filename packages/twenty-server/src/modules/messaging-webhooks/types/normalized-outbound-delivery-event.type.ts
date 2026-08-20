import { type MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';

export type NormalizedOutboundDeliveryEvent = {
  workspaceId: string;
  deliveryStatus: CampaignMessageDeliveryStatus;
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
