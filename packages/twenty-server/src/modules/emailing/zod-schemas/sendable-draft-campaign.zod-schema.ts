import { MessageCampaignStatus } from 'twenty-shared/types';
import { z } from 'zod';

export const sendableDraftCampaignSchema = z.object({
  status: z.literal(MessageCampaignStatus.DRAFT),
  subject: z.string().min(1),
  bodyTemplate: z.string().min(1),
  fromAddress: z.object({ primaryEmail: z.email() }),
  listId: z.string().min(1),
});
