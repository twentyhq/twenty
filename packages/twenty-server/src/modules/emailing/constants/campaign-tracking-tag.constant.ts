import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-message-part.type';

export const CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART: Record<
  CampaignMessagePart,
  string
> = {
  HTML: 'c_h',
  TEXT: 'c_t',
};
