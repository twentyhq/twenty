import { MessageCampaignStatus } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

import { tipTapDocumentSchema } from 'src/modules/emailing/zod-schemas/tiptap-document.zod-schema';

// Bodies are either serialized TipTap JSON (the composer) or plain HTML
// strings (legacy campaigns). JSON that is not a valid document would throw
// inside the renderer mid-send, so it is rejected here instead.
const isSendableBodyTemplate = (bodyTemplate: string): boolean => {
  const parsed = parseJson<unknown>(bodyTemplate);

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return true;
  }

  return tipTapDocumentSchema.safeParse(parsed).success;
};

export const sendableDraftCampaignSchema = z.object({
  status: z.literal(MessageCampaignStatus.DRAFT),
  subject: z.string().min(1),
  bodyTemplate: z.string().min(1).refine(isSendableBodyTemplate, {
    message: 'bodyTemplate is not a valid TipTap document',
  }),
  fromAddress: z.object({ primaryEmail: z.email() }),
  listId: z.string().min(1),
});
