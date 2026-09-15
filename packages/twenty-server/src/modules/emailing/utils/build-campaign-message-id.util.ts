import { v5 } from 'uuid';

import { CAMPAIGN_MESSAGE_ID_NAMESPACE } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';

export const buildCampaignMessageId = ({
  campaignId,
  personId,
}: {
  campaignId: string;
  personId: string;
}): string => v5(`${campaignId}:${personId}`, CAMPAIGN_MESSAGE_ID_NAMESPACE);
