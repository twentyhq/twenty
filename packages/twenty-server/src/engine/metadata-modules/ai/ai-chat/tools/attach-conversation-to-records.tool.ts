import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';

const ATTACH_CONVERSATION_TO_RECORDS_MAX_RECORDS = 100;

const recordToAttachSchema = z.object({
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

export const attachConversationToRecordsInputSchema = z.object({
  records: z
    .array(recordToAttachSchema)
    .min(1)
    .max(ATTACH_CONVERSATION_TO_RECORDS_MAX_RECORDS)
    .describe('The records to attach this conversation to.'),
});

type RecordToAttach = z.infer<typeof recordToAttachSchema>;

type AttachConversationToRecordsInput = z.infer<
  typeof attachConversationToRecordsInputSchema
>;

type RecordAttachmentFailure = RecordToAttach & { error: string };

type AttachConversationToRecordsResult = {
  attached: RecordToAttach[];
  failed: RecordAttachmentFailure[];
};

const FAILURE_MESSAGE = 'Failed to attach this conversation to records';

const deduplicateRecords = (records: RecordToAttach[]): RecordToAttach[] => [
  ...new Map(
    records.map((record) => [
      `${record.objectNameSingular}:${record.recordId}`,
      record,
    ]),
  ).values(),
];

const buildOutputMessage = ({
  attached,
  failed,
}: AttachConversationToRecordsResult): string =>
  failed.length === 0
    ? `Attached this conversation to ${attached.length} record(s)`
    : `Attached this conversation to ${attached.length} of ${attached.length + failed.length} records`;

export const createAttachConversationToRecordsTool = ({
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
    "Attach this conversation to records, so it is listed on each record's Conversations tab " +
    'for anyone who can already see the conversation. Attach the records the conversation is ' +
    'materially about: the one the user is working on, and those you create or change for ' +
    'them. Do not attach records you only read, search or list along the way. Pass every ' +
    'record to attach in a single call. Attaching a record twice is harmless.',
  inputSchema: attachConversationToRecordsInputSchema,
  execute: async ({
    records,
  }: AttachConversationToRecordsInput): Promise<
    ToolOutput<AttachConversationToRecordsResult>
  > => {
    try {
      // resolved at call time so access withdrawn mid-turn is honored
      const { workspaceId, threadId, authContext } =
        await (toolContext.resolveExecutionContext?.() ?? toolContext);

      if (
        !isDefined(threadId) ||
        !isDefined(authContext) ||
        !isUserAuthContext(authContext)
      ) {
        return {
          success: false,
          message: FAILURE_MESSAGE,
          error:
            'Only a conversation with a workspace member can be attached to a record.',
        };
      }

      const result: AttachConversationToRecordsResult = {
        attached: [],
        failed: [],
      };

      // sequential so duplicate links to custom objects, deduplicated by lookup, cannot race
      for (const record of deduplicateRecords(records)) {
        try {
          await agentChatThreadTargetService.attachThreadToRecord({
            workspaceId,
            threadId,
            ...record,
            authContext,
          });
          result.attached.push(record);
        } catch (error) {
          result.failed.push({
            ...record,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const failureReasons = result.failed.map(
        ({ objectNameSingular, recordId, error }) =>
          `${objectNameSingular} ${recordId}: ${error}`,
      );

      if (result.attached.length === 0) {
        return {
          success: false,
          message: FAILURE_MESSAGE,
          error: failureReasons.join('; '),
          result,
        };
      }

      return {
        success: true,
        message: buildOutputMessage(result),
        result,
        ...(failureReasons.length > 0 ? { warnings: failureReasons } : {}),
      };
    } catch (error) {
      return {
        success: false,
        message: FAILURE_MESSAGE,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
