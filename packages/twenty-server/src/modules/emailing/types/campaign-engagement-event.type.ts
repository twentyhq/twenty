import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { type CampaignEngagementActivityClass } from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';
import { type CampaignEngagementEventType } from 'src/modules/emailing/constants/campaign-engagement-event-type.constant';

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
