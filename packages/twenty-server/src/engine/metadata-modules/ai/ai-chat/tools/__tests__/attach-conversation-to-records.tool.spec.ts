import { ATTACH_CONVERSATION_TO_RECORDS_TOOL_NAME } from 'twenty-shared/ai';

import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import {
  attachConversationToRecordsInputSchema,
  createAttachConversationToRecordsTool,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-records.tool';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const THREAD_ID = '20202020-2222-4222-8222-222222222222';
const COMPANY_ID = '20202020-3333-4333-8333-333333333333';
const PERSON_ID = '20202020-4444-4444-8444-444444444444';

const buildUserAuthContext = (workspaceMemberId: string) =>
  ({
    type: 'user',
    workspace: { id: WORKSPACE_ID },
    userWorkspaceId: `user-workspace-of-${workspaceMemberId}`,
    user: { id: `user-of-${workspaceMemberId}` },
    workspaceMemberId,
    workspaceMember: { id: workspaceMemberId },
  }) as UserWorkspaceAuthContext;

const buildToolContext = (overrides: Partial<ToolContext> = {}) =>
  ({
    workspaceId: WORKSPACE_ID,
    threadId: THREAD_ID,
    authContext: buildUserAuthContext('member-at-turn-start'),
    ...overrides,
  }) as ToolContext;

const buildTool = (toolContext: ToolContext) => {
  const attachThreadToRecord = jest.fn(async () => undefined);

  const tool = createAttachConversationToRecordsTool({
    agentChatThreadTargetService: { attachThreadToRecord },
    toolContext,
  });

  return { tool, attachThreadToRecord };
};

describe('attach_conversation_to_records tool', () => {
  it('is named attach_conversation_to_records', () => {
    expect(ATTACH_CONVERSATION_TO_RECORDS_TOOL_NAME).toBe(
      'attach_conversation_to_records',
    );
  });

  it('rejects a record id that is not a UUID', () => {
    expect(
      attachConversationToRecordsInputSchema.safeParse({
        records: [{ objectNameSingular: 'company', recordId: 'acme' }],
      }).success,
    ).toBe(false);
  });

  it('rejects an empty list of records', () => {
    expect(
      attachConversationToRecordsInputSchema.safeParse({ records: [] }).success,
    ).toBe(false);
  });

  it('attaches every record in one call, as the member the turn runs for, judged at call time', async () => {
    const { tool, attachThreadToRecord } = buildTool(
      buildToolContext({
        resolveExecutionContext: async () =>
          buildToolContext({
            authContext: buildUserAuthContext('member-at-call-time'),
          }),
      }),
    );

    const output = await tool.execute({
      records: [
        { objectNameSingular: 'company', recordId: COMPANY_ID },
        { objectNameSingular: 'person', recordId: PERSON_ID },
        { objectNameSingular: 'company', recordId: COMPANY_ID },
      ],
    });

    expect(attachThreadToRecord).toHaveBeenCalledTimes(2);
    expect(attachThreadToRecord).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      objectNameSingular: 'person',
      recordId: PERSON_ID,
      authContext: expect.objectContaining({
        type: 'user',
        workspaceMemberId: 'member-at-call-time',
      }),
    });
    expect(output).toEqual({
      success: true,
      message: 'Attached this conversation to 2 record(s)',
      result: {
        attached: [
          { objectNameSingular: 'company', recordId: COMPANY_ID },
          { objectNameSingular: 'person', recordId: PERSON_ID },
        ],
        failed: [],
      },
    });
  });

  it('refuses a turn that does not run for a workspace member', async () => {
    const { tool, attachThreadToRecord } = buildTool(
      buildToolContext({
        authContext: {
          type: 'system',
          workspace: { id: WORKSPACE_ID },
        } as WorkspaceAuthContext,
      }),
    );

    const output = await tool.execute({
      records: [{ objectNameSingular: 'company', recordId: COMPANY_ID }],
    });

    expect(attachThreadToRecord).not.toHaveBeenCalled();
    expect(output.success).toBe(false);
  });

  it('keeps the records it could attach when others fail, and warns about the rest', async () => {
    const { tool, attachThreadToRecord } = buildTool(buildToolContext());

    attachThreadToRecord.mockRejectedValueOnce(
      new AiException('Record not found', AiExceptionCode.RECORD_NOT_FOUND),
    );

    const output = await tool.execute({
      records: [
        { objectNameSingular: 'company', recordId: COMPANY_ID },
        { objectNameSingular: 'person', recordId: PERSON_ID },
      ],
    });

    expect(output).toEqual({
      success: true,
      message: 'Attached this conversation to 1 of 2 records',
      result: {
        attached: [{ objectNameSingular: 'person', recordId: PERSON_ID }],
        failed: [
          {
            objectNameSingular: 'company',
            recordId: COMPANY_ID,
            error: 'Record not found',
          },
        ],
      },
      warnings: [`company ${COMPANY_ID}: Record not found`],
    });
  });

  it('reports why nothing was attached instead of throwing', async () => {
    const { tool, attachThreadToRecord } = buildTool(buildToolContext());

    attachThreadToRecord.mockRejectedValueOnce(
      new AiException('Record not found', AiExceptionCode.RECORD_NOT_FOUND),
    );

    const output = await tool.execute({
      records: [{ objectNameSingular: 'company', recordId: COMPANY_ID }],
    });

    expect(output).toMatchObject({
      success: false,
      message: 'Failed to attach this conversation to records',
      error: `company ${COMPANY_ID}: Record not found`,
    });
  });
});
