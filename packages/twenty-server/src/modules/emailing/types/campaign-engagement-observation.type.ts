import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-message-part.type';
import { type CampaignEngagementEventType } from 'src/modules/emailing/types/campaign-engagement-event-type.type';

export type CampaignEngagementObservation = {
  eventId: string;
  occurredAt: string;
  eventType: CampaignEngagementEventType;
  deliveryId: string;
  destinationId: string | null;
  messagePart: CampaignMessagePart;
  userAgent: string | null;
};
