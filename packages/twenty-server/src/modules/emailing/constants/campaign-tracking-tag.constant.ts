import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';

// Mirrors the v_h / v_t variable families: the same link gets one tag per
// message part so a click can be attributed to the HTML or the text version.
export const CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART: Record<
  CampaignMessagePart,
  string
> = {
  HTML: 'c_h',
  TEXT: 'c_t',
};
