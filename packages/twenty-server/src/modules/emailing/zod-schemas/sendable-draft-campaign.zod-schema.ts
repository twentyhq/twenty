import { MessageCampaignStatus } from 'twenty-shared/types';
import { emailDocumentSchema, parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

// Bodies are serialized email documents (the composer, the AI campaign
// tool), validated against the strict shared schema: anything else would
// render as nothing (or throw) mid-send, per recipient, so it is rejected
// here instead.
const isSendableBodyTemplate = (bodyTemplate: string): boolean =>
  emailDocumentSchema.safeParse(parseJson<unknown>(bodyTemplate)).success;

export const sendableDraftCampaignSchema = z.object({
  status: z.literal(MessageCampaignStatus.DRAFT),
  subject: z.string().min(1),
  bodyTemplate: z.string().min(1).refine(isSendableBodyTemplate, {
    message: 'bodyTemplate is not a valid email document',
  }),
  fromAddress: z.object({ primaryEmail: z.email() }),
  listId: z.string().min(1),
});
