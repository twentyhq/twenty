import { type CampaignOpenTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-open-tracking-token-payload.type';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';

export type CampaignEngagement =
  | ({ type: 'CLICK' } & CampaignTrackingTokenPayload)
  | ({ type: 'OPEN' } & CampaignOpenTrackingTokenPayload);
