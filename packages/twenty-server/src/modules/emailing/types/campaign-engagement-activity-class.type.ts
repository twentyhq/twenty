import { type CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS } from 'src/modules/emailing/constants/campaign-engagement-activity-class.constant';

export type CampaignEngagementActivityClass =
  (typeof CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS)[keyof typeof CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS];
