import { type DiscoveryService } from '@nestjs/core';

import { ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { AttachConversationToRecordTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-record.tool';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const THREAD_ID = '20202020-2222-4222-8222-222222222222';
const RECORD_ID = '20202020-3333-4333-8333-333333333333';

const memberAuthContext = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: 'member-user-workspace',
  user: { id: 'member-user' },
  workspaceMemberId: 'member',
  workspaceMember: { id: 'member' },
} as unknown as UserWorkspaceAuthContext;

const memberContext: ToolProviderContext = {
  workspaceId: WORKSPACE_ID,
  threadId: THREAD_ID,
  authContext: memberAuthContext,
  rolePermissionConfig: { intersectionOf: { agentRoleId: 'agent-role' } },
};

// Runs the tool through the registry, which applies its declared gates and parses its input
const buildAttachTool = ({
  isAiChatInboxEnabled = true,
}: { isAiChatInboxEnabled?: boolean } = {}) => {
  const attachThreadToRecord = jest.fn(async () => undefined);
  const tool = new AttachConversationToRecordTool({
    attachThreadToRecord,
  } as unknown as AgentChatThreadTargetService);
  const registry = new DefinedToolRegistryService(
    {
      getProviders: () => [{ instance: tool, metatype: tool.constructor }],
    } as unknown as DiscoveryService,
    {
      checkRolesPermissions: jest.fn().mockResolvedValue(true),
    } as unknown as PermissionsService,
    {
      getWorkspaceFeatureFlagsMap: jest.fn().mockResolvedValue({
        [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: isAiChatInboxEnabled,
      }),
    } as unknown as FeatureFlagService,
  );

  registry.onModuleInit();

  const definedTool = registry.findDefinedTool(
    ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME,
  );

  jestExpectToBeDefined(definedTool);

  return {
    attachThreadToRecord,
    listToolNames: async (context: ToolProviderContext) =>
      (
        await registry.getAvailableDescriptors(context, {
          includeSchemas: false,
        })
      ).map(({ name }) => name),
    attach: (context: ToolProviderContext) =>
      registry.execute({
        definedTool,
        args: { objectNameSingular: 'company', recordId: RECORD_ID },
        context,
      }),
  };
};

describe('attach_conversation_to_record tool', () => {
  it('is withheld while the AI chat inbox is off', async () => {
    const { listToolNames } = buildAttachTool({ isAiChatInboxEnabled: false });

    expect(await listToolNames(memberContext)).toEqual([]);
  });

  it('attaches the context thread as the member, within the context role config', async () => {
    const { attach, attachThreadToRecord } = buildAttachTool();

    await expect(attach(memberContext)).resolves.toMatchObject({
      success: true,
      result: { objectNameSingular: 'company', recordId: RECORD_ID },
    });
    expect(attachThreadToRecord).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      threadId: THREAD_ID,
      objectNameSingular: 'company',
      recordId: RECORD_ID,
      authContext: memberAuthContext,
      rolePermissionConfig: memberContext.rolePermissionConfig,
    });
  });

  it('refuses a conversation no member is acting in', async () => {
    const { attach, attachThreadToRecord } = buildAttachTool();

    await expect(
      attach({ ...memberContext, authContext: undefined }),
    ).resolves.toMatchObject({ success: false });
    await expect(
      attach({ ...memberContext, threadId: undefined }),
    ).resolves.toMatchObject({ success: false });
    expect(attachThreadToRecord).not.toHaveBeenCalled();
  });
});
