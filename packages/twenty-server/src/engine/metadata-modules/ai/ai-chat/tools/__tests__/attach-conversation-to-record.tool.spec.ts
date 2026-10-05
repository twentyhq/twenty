import { ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME } from 'twenty-shared/ai';

import {
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import {
  attachConversationToRecordInputSchema,
  createAttachConversationToRecordTool,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-record.tool';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const THREAD_ID = '20202020-2222-4222-8222-222222222222';
const RECORD_ID = '20202020-3333-4333-8333-333333333333';

const buildUserAuthContext = (workspaceMemberId: string) =>
  ({
    type: 'user',
    workspace: { id: WORKSPACE_ID },
    userWorkspaceId: `user-workspace-of-${workspaceMemberId}`,
    user: { id: `user-of-${workspaceMemberId}` },
    workspaceMemberId,
    workspaceMember: { id: workspaceMemberId },
  }) as unknown as UserWorkspaceAuthContext;

const buildToolContext = (overrides: Partial<ToolContext> = {}) =>
  ({
    workspaceId: WORKSPACE_ID,
    roleId: 'role-id',
    threadId: THREAD_ID,
    authContext: buildUserAuthContext('member-at-turn-start'),
    ...overrides,
  }) as ToolContext;

const buildTool = (toolContext: ToolContext) => {
  const attachThreadToRecord = jest.fn(async () => undefined);

  const tool = createAttachConversationToRecordTool({
    agentChatThreadTargetService: { attachThreadToRecord },
    toolContext,
  });

  return { tool, attachThreadToRecord };
};

describe('attach_conversation_to_record tool', () => {
  it('is named attach_conversation_to_record', () => {
    expect(ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME).toBe(
      'attach_conversation_to_record',
    );
  });

  it('rejects a record id that is not a UUID', () => {
    expect(
      attachConversationToRecordInputSchema.safeParse({
        objectNameSingular: 'company',
        recordId: 'acme',
      }).success,
    ).toBe(false);
  });

  it('attaches the current conversation as the member the turn runs for, judged at call time', async () => {
    const { tool, attachThreadToRecord } = buildTool(
      buildToolContext({
        resolveExecutionContext: async () =>
          buildToolContext({
            authContext: buildUserAuthContext('member-at-call-time'),
          }),
      }),
    );

    const output = await tool.execute({
      objectNameSingular: 'company',
      recordId: RECORD_ID,
    });

    expect(attachThreadToRecord).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      objectNameSingular: 'company',
      recordId: RECORD_ID,
      authContext: expect.objectContaining({
        type: 'user',
        workspaceMemberId: 'member-at-call-time',
      }),
    });
    expect(output).toEqual({
      success: true,
      message: 'Attached this conversation to the company record',
      result: { objectNameSingular: 'company', recordId: RECORD_ID },
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
      objectNameSingular: 'company',
      recordId: RECORD_ID,
    });

    expect(attachThreadToRecord).not.toHaveBeenCalled();
    expect(output.success).toBe(false);
  });

  it('reports why an attachment failed instead of throwing', async () => {
    const { tool, attachThreadToRecord } = buildTool(buildToolContext());

    attachThreadToRecord.mockRejectedValueOnce(
      new AiException('Record not found', AiExceptionCode.RECORD_NOT_FOUND),
    );

    const output = await tool.execute({
      objectNameSingular: 'company',
      recordId: RECORD_ID,
    });

    expect(output).toEqual({
      success: false,
      message: 'Failed to attach this conversation to the company record',
      error: 'Record not found',
    });
  });
});
