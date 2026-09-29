import { z } from 'zod';

import { ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';

export { ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME };

export const attachConversationToRecordInputSchema = z.object({
  objectNameSingular: z
    .string()
    .describe(
      'Singular name of the record\'s object, e.g. "company", "person" or "opportunity".',
    ),
  recordId: z
    .string()
    .uuid()
    .describe(
      'ID of the record, as a tool returned it or the browsing context gave it.',
    ),
});

type AttachConversationToRecordInput = z.infer<
  typeof attachConversationToRecordInputSchema
>;

export const createAttachConversationToRecordTool = ({
  agentChatThreadTargetService,
  toolContext,
}: {
  agentChatThreadTargetService: Pick<
    AgentChatThreadTargetService,
    'attachThreadToRecord'
  >;
  toolContext: ToolContext;
}) => ({
  description:
    "Attach this conversation to a record, so it is listed on the record's Conversations tab " +
    'for anyone who can already see the conversation. Attach the records the conversation is ' +
    'materially about: the one the user is working on, and those you create or change for ' +
    'them. Do not attach records you only read, search or list along the way. Attaching a ' +
    'record twice is harmless.',
  inputSchema: attachConversationToRecordInputSchema,
  execute: async ({
    objectNameSingular,
    recordId,
  }: AttachConversationToRecordInput): Promise<ToolOutput> => {
    const failureMessage = `Failed to attach this conversation to the ${objectNameSingular} record`;

    try {
      // Resolved at call time, as registry tools are, so access withdrawn
      // since the turn began is honored.
      const { workspaceId, threadId, authContext } =
        await (toolContext.resolveExecutionContext?.() ?? toolContext);

      if (
        !isDefined(threadId) ||
        !isDefined(authContext) ||
        !isUserAuthContext(authContext)
      ) {
        return {
          success: false,
          message: failureMessage,
          error:
            'Only a conversation with a workspace member can be attached to a record.',
        };
      }

      await agentChatThreadTargetService.attachThreadToRecord({
        workspaceId,
        workspaceMemberId: authContext.workspaceMemberId,
        threadId,
        objectNameSingular,
        recordId,
        authContext,
      });

      return {
        success: true,
        message: `Attached this conversation to the ${objectNameSingular} record`,
        result: { objectNameSingular, recordId },
      };
    } catch (error) {
      return {
        success: false,
        message: failureMessage,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
