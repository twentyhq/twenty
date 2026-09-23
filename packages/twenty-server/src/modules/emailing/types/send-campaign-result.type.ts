import { type CampaignAudienceResolution } from 'src/engine/core-modules/emailing-domain/types/campaign-audience-resolution.type';

export type SendCampaignResult = {
  campaignId: string;
  queuedCount: number;
  audience: CampaignAudienceResolution['audience'];
};
