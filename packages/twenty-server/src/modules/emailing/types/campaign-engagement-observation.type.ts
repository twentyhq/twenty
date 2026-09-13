import { type CampaignEngagementEventType } from 'src/modules/emailing/types/campaign-engagement-event-type.type';

export type CampaignEngagementObservation = {
  eventId: string;
  occurredAt: string;
  eventType: CampaignEngagementEventType;
  deliveryId: string;
  shortLinkId: string | null;
  userAgent: string | null;
};
