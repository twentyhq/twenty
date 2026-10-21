import { type CampaignEngagement } from 'src/modules/emailing/types/campaign-engagement.type';

export type CampaignEngagementObservation = CampaignEngagement & {
  eventId: string;
  occurredAt: string;
  userAgent: string | null;
};
