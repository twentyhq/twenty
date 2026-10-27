import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { type AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { createAttachConversationToRecordTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/attach-conversation-to-record.tool';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const getAgentChatThreadService = () =>
  getAppProviderByClassName<AgentChatThreadService>('AgentChatThreadService');

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
const companyId = randomUUID();

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
    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { id: companyId, name: 'Renewal account' },
      }),
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
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: companyId,
      }),
    );
  });

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

  const listLinksAttachedTo = async (
    recordId: string,
    token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ): Promise<{ id: string; threadId: string }[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'agentChatThreadTarget',
        objectMetadataPluralName: 'agentChatThreadTargets',
        gqlFields: 'id threadId',
        filter: { targetCompanyId: { eq: recordId } },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.agentChatThreadTargets.edges.map(
      ({ node }: { node: { id: string; threadId: string } }) => node,
    );
  };

  const listConversationIdsAttachedTo = async (
    recordId: string,
    token?: string,
  ) =>
    (await listLinksAttachedTo(recordId, token)).map(
      ({ threadId: linkedThreadId }) => linkedThreadId,
    );

  it('links the conversation to the record once, however often it is asked', async () => {
    const tool = await buildTool();

    await expect(
      tool.execute({ objectNameSingular: 'company', recordId: companyId }),
    ).resolves.toMatchObject({ success: true });
    await expect(
      tool.execute({ objectNameSingular: 'company', recordId: companyId }),
    ).resolves.toMatchObject({ success: true });

    const attachedConversationIds =
      await listConversationIdsAttachedTo(companyId);

    expect(
      attachedConversationIds.filter(
        (conversationId: string) => conversationId === threadId,
      ),
    ).toHaveLength(1);
  });

  it("hides a link to another member's conversation until it is shared with them", async () => {
    const tool = await buildTool();

    await tool.execute({ objectNameSingular: 'company', recordId: companyId });

    const [link] = (await listLinksAttachedTo(companyId)).filter(
      ({ threadId: linkedThreadId }) => linkedThreadId === threadId,
    );
    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(workspaceId, ['flatObjectMetadataMaps']);
    const share = {
      objectMetadataId:
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ]!.id,
      recordId: threadId,
      sourceId: threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      accessLevel: RecordShareAccessLevel.READ,
    };
    const findLinkAsJony = () =>
      makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'agentChatThreadTarget',
          objectMetadataPluralName: 'agentChatThreadTargets',
          gqlFields: 'id',
          filter: { id: { eq: link.id } },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
    const deleteLinkAsJony = () =>
      makeGraphqlApiRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'agentChatThreadTarget',
          gqlFields: 'id',
          recordId: link.id,
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

    expect(
      await listConversationIdsAttachedTo(
        companyId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
    ).not.toContain(threadId);
    expect(
      (await findLinkAsJony()).body.data.agentChatThreadTargets.edges,
    ).toEqual([]);
    expect((await deleteLinkAsJony()).body.errors).toBeDefined();

    try {
      await setManualRecordShare({ workspaceId, share, enabled: true });

      expect(
        await listConversationIdsAttachedTo(
          companyId,
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        ),
      ).toContain(threadId);
      expect(
        (await findLinkAsJony()).body.data.agentChatThreadTargets.edges,
      ).toMatchObject([{ node: { id: link.id } }]);
      // Reading the conversation does not let them detach it
      expect((await deleteLinkAsJony()).body.errors).toBeDefined();
    } finally {
      await setManualRecordShare({ workspaceId, share, enabled: false });
    }

    expect(await listConversationIdsAttachedTo(companyId)).toContain(threadId);
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
