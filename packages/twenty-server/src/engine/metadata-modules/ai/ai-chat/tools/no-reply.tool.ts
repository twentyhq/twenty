import { z } from 'zod';

type NoReplyOutput = {
  success: true;
};

export const createNoReplyTool = () => ({
  description:
    'End your turn without replying. Call it instead of writing anything when the latest ' +
    'message does not need an answer from you: a thank-you or acknowledgement, or people in ' +
    'the chat talking to each other rather than to you. Write no text in the same turn. ' +
    'Never use it to skip a question, request or task addressed to you.',
  inputSchema: z.object({}),
  execute: async (): Promise<NoReplyOutput> => ({ success: true }),
});
