import { emailDocumentSchema, isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

export const SaveCampaignToolInputZodSchema = z.object({
  campaignId: z
    .string()
    .refine((value) => isValidUuid(value))
    .optional()
    .describe(
      'Omit to create a new draft campaign. Provide the UUID of an existing messageCampaign record to edit it; when the user refers to the campaign they are viewing, take it from the browsing context.',
    ),
  name: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe('The internal campaign name shown in the campaign list.'),
  subject: z
    .string()
    .max(998)
    .optional()
    .describe(
      'The email subject line. Supports the same {{variables}} as the body.',
    ),
  body: emailDocumentSchema
    .optional()
    .describe(
      'The full email document that replaces the campaign body. ' +
        'A document is {type: "doc", content: [...blocks]}. Blocks: paragraph and heading (level 1-3) hold inline text, variableTag chips ({attrs: {variable: "{{firstName}}"}}) and hardBreak; emailSection wraps blocks in a styled band; emailColumns holds 2-4 emailColumn children; emailButton is a call-to-action with an href; image, emailDivider, bulletList/orderedList and emailHtml (raw HTML) complete the set. ' +
        'Style attributes are inline CSS strings, e.g. "padding: 12px; background-color: #f4f4f5;". ' +
        'Per-recipient variables reference person fields by path, e.g. {{name.firstName}}, {{emails.primaryEmail}}, {{city}} or any custom person field; {{firstName}}, {{lastName}}, {{fullName}}, {{email}} and {{personId}} also work. They apply in text, button and link URLs and raw HTML, and unknown names are rejected with the available list. ' +
        'To modify an existing body, read the record first, edit the parsed document and send the whole result back.',
    ),
});

export type SaveCampaignToolInput = z.infer<
  typeof SaveCampaignToolInputZodSchema
>;
