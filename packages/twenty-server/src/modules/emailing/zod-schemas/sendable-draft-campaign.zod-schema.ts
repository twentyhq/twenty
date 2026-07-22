import { z } from 'zod';

import { CAMPAIGN_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';

export const sendableDraftCampaignSchema = z.object({
  status: z.literal(CAMPAIGN_STATUS.DRAFT),
  subject: z.string().min(1),
  fromAddress: z.object({ primaryEmail: z.string().min(1) }),
  listId: z.string().min(1),
});
