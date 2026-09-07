import { MessageCampaignStatus } from 'twenty-shared/types';
import { parseCanonicalEmailDocument, parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

const isSendableBodyTemplate = (bodyTemplate: string): boolean =>
  parseCanonicalEmailDocument(parseJson<unknown>(bodyTemplate)).success;

export const sendableCampaignSchema = z.object({
  status: z.enum([
    MessageCampaignStatus.DRAFT,
    MessageCampaignStatus.SCHEDULED,
  ]),
  subject: z.string().min(1),
  bodyTemplate: z.string().min(1).refine(isSendableBodyTemplate, {
    message: 'bodyTemplate is not a valid email document',
  }),
  scheduledAt: z.coerce.date().nullish(),
  fromAddress: z.object({ primaryEmail: z.email() }),
  listId: z.string().min(1),
  unsubscribeTopicId: z.string().nullish(),
});
