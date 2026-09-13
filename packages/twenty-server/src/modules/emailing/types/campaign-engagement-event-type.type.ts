import { type CAMPAIGN_ENGAGEMENT_EVENT_TYPE } from 'src/modules/emailing/constants/campaign-engagement-event-type.constant';

export type CampaignEngagementEventType =
  (typeof CAMPAIGN_ENGAGEMENT_EVENT_TYPE)[keyof typeof CAMPAIGN_ENGAGEMENT_EVENT_TYPE];
