// UNCLASSIFIED means "not identified as automated", never "verified human".
export const CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS = {
  UNCLASSIFIED: 'UNCLASSIFIED',
  SUSPECTED_AUTOMATION: 'SUSPECTED_AUTOMATION',
  PRIVACY_PROXY: 'PRIVACY_PROXY',
} as const;

export type CampaignEngagementActivityClass =
  (typeof CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS)[keyof typeof CAMPAIGN_ENGAGEMENT_ACTIVITY_CLASS];
