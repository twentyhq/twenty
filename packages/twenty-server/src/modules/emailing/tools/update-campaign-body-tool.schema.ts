import {
  CAMPAIGN_VARIABLE_NAMES,
  emailDocumentSchema,
  isValidUuid,
} from 'twenty-shared/utils';
import { z } from 'zod';

export const UpdateCampaignBodyToolInputZodSchema = z.object({
  campaignId: z
    .string()
    .refine((value) => isValidUuid(value))
    .describe(
      'The UUID of the messageCampaign record to edit. When the user refers to the campaign they are viewing, take it from the browsing context.',
    ),
  body: emailDocumentSchema.describe(
    'The full email document that replaces the campaign body. ' +
      'A document is {type: "doc", content: [...blocks]}. Blocks: paragraph and heading (level 1-3) hold inline text, variableTag chips ({attrs: {variable: "{{firstName}}"}}) and hardBreak; emailSection wraps blocks in a styled band; emailColumns holds 2-4 emailColumn children; emailButton is a call-to-action with an href; image, emailDivider, bulletList/orderedList and emailHtml (raw HTML) complete the set. ' +
      'Style attributes are inline CSS strings, e.g. "padding: 12px; background-color: #f4f4f5;". ' +
      `Per-recipient variables (${CAMPAIGN_VARIABLE_NAMES.map((name) => `{{${name}}}`).join(', ')}) work in text, button and link URLs and raw HTML. ` +
      'To modify an existing body, read the record first, edit the parsed document and send the whole result back.',
  ),
});

export type UpdateCampaignBodyToolInput = z.infer<
  typeof UpdateCampaignBodyToolInputZodSchema
>;
