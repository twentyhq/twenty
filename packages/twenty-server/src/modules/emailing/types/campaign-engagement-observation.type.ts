import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { type CampaignEngagementEventType } from 'src/modules/emailing/constants/campaign-engagement-event-type.constant';

// Minted once at HTTP receipt and carried unchanged through every retry, so
// the same observation always produces the same event row.
export type CampaignEngagementObservation = {
  eventId: string;
  occurredAt: string;
  eventType: CampaignEngagementEventType;
  deliveryId: string;
  destinationId: string | null;
  messagePart: CampaignMessagePart;
  userAgent: string | null;
};
