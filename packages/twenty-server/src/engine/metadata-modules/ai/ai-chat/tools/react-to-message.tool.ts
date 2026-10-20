import { type AgentMessageReactionSummary } from 'twenty-shared/ai';
import { z } from 'zod';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const reactToMessageInputSchema = z.object({
  emoji: z.string().describe('A single emoji, e.g. "👍".'),
});

type ReactToMessageInput = z.infer<typeof reactToMessageInputSchema>;

export const createReactToMessageTool = ({
  reactToLatestMemberMessage,
}: {
  reactToLatestMemberMessage: (
    emoji: string,
  ) => Promise<AgentMessageReactionSummary[]>;
}) => ({
  description:
    "React with one emoji to the member's latest message, as a teammate would in chat. " +
    'Use it to acknowledge a message that needs no words, such as a thank-you or a ' +
    'confirmation. It does not replace an answer: still reply in text when the message ' +
    'asks for something.',
  inputSchema: reactToMessageInputSchema,
  execute: async ({ emoji }: ReactToMessageInput): Promise<ToolOutput> => {
    try {
      await reactToLatestMemberMessage(emoji);

      return { success: true, message: `Reacted with ${emoji}` };
    } catch (error) {
      return {
        success: false,
        message: `Failed to react with ${emoji}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
