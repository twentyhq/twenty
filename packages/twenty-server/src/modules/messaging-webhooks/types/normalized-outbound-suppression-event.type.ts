import { type MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

export type NormalizedOutboundSuppressionEvent = {
  workspaceId: string;
  reason: MessageSuppressionReason.BOUNCE | MessageSuppressionReason.COMPLAINT;
  emailAddresses: string[];
  providerMessageId: string | null;
  providerEventId: string | null;
};
