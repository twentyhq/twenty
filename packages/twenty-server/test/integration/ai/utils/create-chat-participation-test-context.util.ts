import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentChatThreadConversationType } from 'src/engine/metadata-modules/ai/ai-history/types/agent-chat-thread-conversation-type.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

export const createChatParticipationTestContext = async () => {
  const workspaceId = SEED_APPLE_WORKSPACE_ID;
  const workspaceMemberId = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
  const userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.JANE;
  const schema = getWorkspaceSchemaName(workspaceId);
  const threadIds = new Set<string>();
  const threadService = getAppProviderByClassName<AgentChatThreadService>(
    'AgentChatThreadService',
  );
  const chatService =
    getAppProviderByClassName<AgentChatService>('AgentChatService');
  const sharingService = getAppProviderByClassName<AgentChatSharingService>(
    'AgentChatSharingService',
  );
  const featureFlagService =
    getAppProviderByClassName<FeatureFlagService>('FeatureFlagService');
  const wasInboxEnabled = await featureFlagService.isFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    workspaceId,
  );
  await featureFlagService.upsertWorkspaceFeatureFlag({
    workspaceId,
    featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    value: true,
  });

  const registerThread = (threadId: string = randomUUID()) => {
    threadIds.add(threadId);

    return threadId;
  };
  const setStoredAssistantParticipation = ({
    threadId,
    isAssistantParticipant,
  }: {
    threadId: string;
    isAssistantParticipant: boolean;
  }) =>
    global.testDataSource.query(
      `UPDATE "${schema}"."agentChatThread"
       SET "isAssistantParticipant" = $2 WHERE id = $1`,
      [threadId, isAssistantParticipant],
    );
  const createThread = async (isAssistantParticipant = true) => {
    const threadId = registerThread();

    await threadService.createThread({
      id: threadId,
      workspaceId,
      workspaceMemberId,
    });

    if (!isAssistantParticipant) {
      await setStoredAssistantParticipation({
        threadId,
        isAssistantParticipant,
      });
    }

    return threadId;
  };
  const readThread = async (threadId: string) => {
    const [thread]: {
      isAssistantParticipant: boolean;
      conversationType: AgentChatThreadConversationType;
      channelId: string | null;
      workspaceMemberId: string;
      lastActivityAt: Date;
      deletedAt: Date | null;
      activeStreamId: string | null;
    }[] = await global.testDataSource.query(
      `SELECT "isAssistantParticipant", "conversationType", "channelId", "workspaceMemberId", "lastActivityAt", "deletedAt", "activeStreamId"
       FROM "${schema}"."agentChatThread" WHERE id = $1`,
      [threadId],
    );

    return thread;
  };
  const readParticipants = (
    threadId: string,
  ): Promise<
    {
      workspaceMemberId: string;
      lastReadAt: Date | null;
      archivedAt: Date | null;
      isSubscribed: boolean;
      lastMentionedAt: Date | null;
    }[]
  > =>
    global.testDataSource.query(
      `SELECT "workspaceMemberId", "lastReadAt", "archivedAt", "isSubscribed", "lastMentionedAt"
     FROM "${schema}"."agentChatThreadParticipant" WHERE "threadId" = $1`,
      [threadId],
    );
  const share = async ({
    threadId,
    recipientWorkspaceMemberId,
    accessLevel,
  }: {
    threadId: string;
    recipientWorkspaceMemberId: string;
    accessLevel: RecordShareAccessLevel;
  }) => {
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const { flatObjectMetadataMaps } = await cache.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
    ]);
    const objectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    expect(objectMetadata).toBeDefined();

    if (!isDefined(objectMetadata)) {
      return;
    }

    await setManualRecordShare({
      workspaceId,
      enabled: true,
      share: {
        objectMetadataId: objectMetadata.id,
        recordId: threadId,
        sourceId: threadId,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        principalId: recipientWorkspaceMemberId,
        accessLevel,
      },
    });
  };
  const saveMessage = ({
    threadId,
    id = randomUUID(),
  }: {
    threadId: string;
    id?: string;
  }) =>
    chatService.addMessage({
      id,
      resolveMentionForWorkspaceMemberId: workspaceMemberId,
      threadId,
      workspaceId,
      userWorkspaceId,
      turnStatus: AgentTurnStatus.COMPLETED,
      uiMessage: {
        role: AgentMessageRole.USER,
        parts: [{ type: 'text', text: 'Hello' }],
      },
    });

  return {
    workspaceId,
    workspaceMemberId,
    userWorkspaceId,
    schema,
    threadService,
    chatService,
    sharingService,
    featureFlagService,
    registerThread,
    createThread,
    readThread,
    readParticipants,
    share,
    saveMessage,
    cleanup: async () => {
      await waitForAllJobsToFinish();
      await global.testDataSource.query(
        `DELETE FROM "${schema}"."agentChatThread" WHERE id = ANY($1::uuid[])`,
        [[...threadIds]],
      );
      await global.testDataSource.query(
        `DELETE FROM "${schema}"."recordShare" WHERE "recordId" = ANY($1::uuid[])`,
        [[...threadIds]],
      );
      await featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId,
        featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        value: wasInboxEnabled,
      });
    },
  };
};
