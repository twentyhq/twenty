export const CAMPAIGN_ENGAGEMENT_EVENT_TYPE = {
  CLICK: 'CLICK',
} as const;

export type CampaignEngagementEventType =
  (typeof CAMPAIGN_ENGAGEMENT_EVENT_TYPE)[keyof typeof CAMPAIGN_ENGAGEMENT_EVENT_TYPE];
