import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { type AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { createAttachConversationToRecordTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-record.tool';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
const companyId = COMPANY_DATA_SEED_IDS.ID_1;

const CHAT_THREADS_FOR_RECORD =
  parse(`query ChatThreadsForRecord($objectNameSingular: String!, $recordId: UUID!) {
  chatThreadsForRecord(objectNameSingular: $objectNameSingular, recordId: $recordId, limit: 20) { id }
}`);

describe('Attaching a conversation to a record from a chat turn', () => {
  let chat: AgentChatService;
  let actors: AgentChatActorService;
  let targets: AgentChatThreadTargetService;
  let message: Awaited<ReturnType<AgentChatService['addMessage']>>;
  const threadId = randomUUID();

  beforeAll(async () => {
    chat = getAppProviderByClassName<AgentChatService>('AgentChatService');
    actors = getAppProviderByClassName<AgentChatActorService>(
      'AgentChatActorService',
    );
    targets = getAppProviderByClassName<AgentChatThreadTargetService>(
      'AgentChatThreadTargetService',
    );
    await chat.createThread({
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
    await chat.hardDeleteThread({ workspaceId, workspaceMemberId, threadId });
  });

  // Built from the same authorization ChatExecutionService gives the turn.
  const buildTool = async () => {
    const { authorization } = await actors.authorizeJob({
      workspaceId,
      threadId,
      messageId: message.id,
      turnId: message.turnId!,
      userWorkspaceId,
    });

    return createAttachConversationToRecordTool({
      agentChatThreadTargetService: targets,
      toolContext: {
        workspaceId,
        threadId,
        userWorkspaceId,
        ...authorization,
      },
    });
  };

  const listConversationIdsAttachedTo = async (recordId: string) => {
    const response = await makeMetadataApiRequest({
      query: CHAT_THREADS_FOR_RECORD,
      variables: { objectNameSingular: 'company', recordId },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.chatThreadsForRecord.map(
      ({ id }: { id: string }) => id,
    );
  };

  it('lists the conversation on the record it attached it to', async () => {
    const tool = await buildTool();

    await expect(
      tool.execute({ objectNameSingular: 'company', recordId: companyId }),
    ).resolves.toMatchObject({ success: true });
    await expect(
      tool.execute({ objectNameSingular: 'company', recordId: companyId }),
    ).resolves.toMatchObject({ success: true });

    expect(await listConversationIdsAttachedTo(companyId)).toEqual(
      expect.arrayContaining([threadId]),
    );
  });

  it('reports a record that does not exist without attaching anything', async () => {
    const tool = await buildTool();
    const missingRecordId = randomUUID();

    await expect(
      tool.execute({
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
    const tool = await buildTool();

    await expect(
      tool.execute({
        objectNameSingular: 'unknownObject',
        recordId: companyId,
      }),
    ).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('Unknown object "unknownObject"'),
    });
  });
});
