import {
  PROPOSE_EMAIL_TOOL_NAME,
  type ProposeEmailToolResult,
  type ProposedEmail,
} from 'twenty-shared/ai';
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

type ProposeEmailPendingOutput = {
  success: true;
  message: string;
  result: ProposeEmailToolResult;
};

// only an agent without registry tools proposes emails this way, since it cannot propose send_email
export const createProposeEmailTool = () => ({
  description:
    'Propose an email for the user to review before it goes out. The conversation pauses while they edit it and then send it, save it as a draft or discard it; the result says which, with the final content. Prefer this over sending without review.',
  inputSchema: proposeEmailInputSchema,
  execute: async (
    input: ProposedEmail,
  ): Promise<ProposeEmailPendingOutput> => ({
    success: true,
    message: 'Email proposed to the user; awaiting their decision.',
    result: { status: 'pending', email: input },
  }),
});
