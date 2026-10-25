import { randomUUID } from 'node:crypto';

import { ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME } from 'twenty-shared/ai';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const getAgentChatThreadService = () =>
  getAppProviderByClassName<AgentChatThreadService>('AgentChatThreadService');

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
const companyId = COMPANY_DATA_SEED_IDS.ID_1;

describe('Attaching a conversation to a record from a chat turn', () => {
  let chat: AgentChatService;
  let actors: AgentChatActorService;
  let toolRegistry: ToolRegistryService;
  let message: Awaited<ReturnType<AgentChatService['addMessage']>>;
  const threadId = randomUUID();

  beforeAll(async () => {
    chat = getAppProviderByClassName<AgentChatService>('AgentChatService');
    actors = getAppProviderByClassName<AgentChatActorService>(
      'AgentChatActorService',
    );
    toolRegistry = getAppProviderByClassName<ToolRegistryService>(
      'ToolRegistryService',
    );
    await getAgentChatThreadService().createThread({
      workspaceId,
      workspaceMemberId,
      id: threadId,
      title: 'Renewal prep',
    });
    message = await chat.addMessage({
      workspaceId,
      threadId,
      userWorkspaceId,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Prepare the renewal call' }],
      },
    });
  });

  afterAll(async () => {
    await destroyAgentChatThread({ threadId });
  });

  // the chat turn reaches the tool through the registry, so its gates apply here too
  const attach = async (input: {
    objectNameSingular: string;
    recordId: string;
  }) => {
    const { authorization } = await actors.authorizeJob({
      workspaceId,
      threadId,
      messageId: message.id,
      turnId: message.turnId!,
      userWorkspaceId,
    });

    return toolRegistry.resolveAndExecute(
      ATTACH_CONVERSATION_TO_RECORD_TOOL_NAME,
      input,
      { workspaceId, threadId, userWorkspaceId, ...authorization },
    );
  };

  const listConversationIdsAttachedTo = async (recordId: string) => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'agentChatThreadTarget',
        objectMetadataPluralName: 'agentChatThreadTargets',
        gqlFields: 'id threadId',
        filter: { targetCompanyId: { eq: recordId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.agentChatThreadTargets.edges.map(
      ({ node }: { node: { threadId: string } }) => node.threadId,
    );
  };

  it('links the conversation to the record once, however often it is asked', async () => {
    await expect(
      attach({ objectNameSingular: 'company', recordId: companyId }),
    ).resolves.toMatchObject({ success: true });
    await expect(
      attach({ objectNameSingular: 'company', recordId: companyId }),
    ).resolves.toMatchObject({ success: true });

    const attachedConversationIds =
      await listConversationIdsAttachedTo(companyId);

    expect(
      attachedConversationIds.filter(
        (conversationId: string) => conversationId === threadId,
      ),
    ).toHaveLength(1);
  });

  it('reports a record that does not exist without attaching anything', async () => {
    const missingRecordId = randomUUID();

    await expect(
      attach({
        objectNameSingular: 'company',
        recordId: missingRecordId,
      }),
    ).resolves.toEqual({
      success: false,
      message: 'Failed to attach this conversation to the company record',
      error: expect.stringContaining('Record not found'),
    });
  });

  it('reports an object conversations cannot be attached to', async () => {
    await expect(
      attach({
        objectNameSingular: 'unknownObject',
        recordId: companyId,
      }),
    ).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('Unknown object "unknownObject"'),
    });
  });
});
