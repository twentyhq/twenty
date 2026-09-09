import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-message-part.type';
import { type CampaignEngagementActivityClass } from 'src/modules/emailing/types/campaign-engagement-activity-class.type';
import { type CampaignEngagementEventType } from 'src/modules/emailing/types/campaign-engagement-event-type.type';

export type CampaignEngagementEvent = {
  workspaceId: string;
  messageCampaignId: string;
  deliveryId: string;
  recipientEmailHash: string;
  personId: string;
  eventId: string;
  occurredAt: string;
  eventType: CampaignEngagementEventType;
  destinationId: string | null;
  messagePart: CampaignMessagePart;
  activityClass: CampaignEngagementActivityClass;
  classificationVersion: number;
  classificationReasons: string[];
  clientFamily: string;
};
