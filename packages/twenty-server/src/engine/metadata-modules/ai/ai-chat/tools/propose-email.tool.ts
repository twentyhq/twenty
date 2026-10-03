import { PROPOSE_EMAIL_TOOL_NAME } from 'twenty-shared/ai';
import { isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

export { PROPOSE_EMAIL_TOOL_NAME };

export const proposeEmailInputSchema = z.object({
  recipients: z
    .object({
      to: z.string().describe('Comma-separated recipient email addresses.'),
      cc: z
        .string()
        .optional()
        .default('')
        .describe('Comma-separated CC email addresses.'),
      bcc: z
        .string()
        .optional()
        .default('')
        .describe('Comma-separated BCC email addresses.'),
    })
    .describe('Who the email goes to.'),
  subject: z.string().describe('The email subject line.'),
  body: z
    .string()
    .describe(
      'The email body as plain text. Separate paragraphs with a blank line.',
    ),
  connectedAccountId: z
    .string()
    .refine((value) => isValidUuid(value))
    .optional()
    .describe(
      'The UUID of the connected account to send from, from find_connected_accounts. Leave it out to let the person pick.',
    ),
});
