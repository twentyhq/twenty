import { MessageCampaignStatus } from 'twenty-shared/types';
import { emailDocumentSchema, parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

// Bodies are either serialized email documents (the composer, the AI campaign
// tool) or plain HTML strings (legacy campaigns). JSON is validated against
// the strict shared schema: an unknown block type or malformed node would
// otherwise render as nothing (or throw) mid-send, per recipient.
const isSendableBodyTemplate = (bodyTemplate: string): boolean => {
  const parsed = parseJson<unknown>(bodyTemplate);

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return true;
  }

  return emailDocumentSchema.safeParse(parsed).success;
};

export const sendableDraftCampaignSchema = z.object({
  status: z.literal(MessageCampaignStatus.DRAFT),
  subject: z.string().min(1),
  bodyTemplate: z.string().min(1).refine(isSendableBodyTemplate, {
    message: 'bodyTemplate is not a valid email document',
  }),
  fromAddress: z.object({ primaryEmail: z.email() }),
  listId: z.string().min(1),
});
