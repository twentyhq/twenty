import { type CampaignEngagementActivityClass } from 'src/modules/emailing/types/campaign-engagement-activity-class.type';

export type ShortLinkClickEvent = {
  workspaceId: string;
  messageCampaignId: string;
  shortLinkId: string;
  deliveryId: string;
  eventId: string;
  occurredAt: string;
  activityClass: CampaignEngagementActivityClass;
};
