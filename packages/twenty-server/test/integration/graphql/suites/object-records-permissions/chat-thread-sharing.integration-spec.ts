import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { type AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type AddWorkflowRunToChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607161319-add-workflow-run-to-chat-threads.command';
import { EnableCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790312694997-enable-common-record-sharing.command';
import { type AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type RecordSharePrincipalInput } from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { computeEventName } from 'src/engine/workspace-event-emitter/utils/compute-event-name';

// Avoid loading the migration runner's ESM file dependencies inside Jest. The
// command below receives the real migration service from the running test app.
jest.mock(
  'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service',
  () => ({ WorkspaceMigrationValidateBuildAndRunService: class {} }),
);

const READ_THREAD =
  parse(`query ReadSharedThread($id: UUID!, $objectMetadataId: UUID!) {
  chatThread(id: $id) { id title }
  recordPermissions(targets: [{ objectMetadataId: $objectMetadataId, recordId: $id }]) { permissions { canRead canUpdate canDelete canSoftDelete } }
}`);
const readThread = async (
  id: string,
  token: string | null = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) => {
  const cache = getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  );
  const { flatObjectMetadataMaps } = await cache.getOrRecompute(
    SEED_APPLE_WORKSPACE_ID,
    ['flatObjectMetadataMaps'],
  );
  const objectMetadataId =
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ]!.id;
  return makeMetadataApiRequest(
    { query: READ_THREAD, variables: { id, objectMetadataId } },
    token,
  );
};
const SET_SHARE =
  parse(`mutation SetThreadShare($target: RecordSharingTargetInput!, $principal: RecordSharePrincipalInput!, $enabled: Boolean!, $accessLevel: RecordShareAccessLevel) {
  setRecordShare(target: $target, principal: $principal, enabled: $enabled, accessLevel: $accessLevel) { isEnabled }
}`);

describe('Conversation sharing through the authenticated API', () => {
  it.each(['member', 'role', 'everyone', 'setup'])(
    'grants read-only %s access and denies it immediately after revocation',
    async (audience) => {
      const workspaceId = SEED_APPLE_WORKSPACE_ID;
      const cache = getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      );
      const { featureFlagsMap, userWorkspaceRoleMap, flatObjectMetadataMaps } =
        await cache.getOrRecompute(workspaceId, [
          'featureFlagsMap',
          'userWorkspaceRoleMap',
          'flatObjectMetadataMaps',
        ]);
      const previousEnabled =
        featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] === true;
      const roleId = userWorkspaceRoleMap[USER_WORKSPACE_DATA_SEED_IDS.JONY];
      if (!isDefined(roleId)) {
        throw new Error('Seeded recipient role is missing');
      }
      const principal: RecordSharePrincipalInput =
        audience === 'member'
          ? { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY }
          : audience === 'role'
            ? { roleId }
            : { everyone: true };
      const chatService =
        getAppProviderByClassName<AgentChatService>('AgentChatService');
      const threadId =
        audience === 'setup'
          ? buildWorkspaceSetupChatThreadId({
              workspaceId,
              userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
            })
          : randomUUID();
      const target = {
        objectMetadataId:
          flatObjectMetadataMaps.byUniversalIdentifier[
            STANDARD_OBJECTS.agentChatThread.universalIdentifier
          ]!.id,
        recordId: threadId,
      };
      const owner = {
        workspaceId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      };
      await chatService.createThread({
        ...owner,
        id: threadId,
        title: 'Private sharing regression',
      });
      const read = () => readThread(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN);
      const listedThreadIds = async () => {
        const response = await makeMetadataApiRequest(
          { query: parse('query ReadableThreads { chatThreads { id } }') },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(response.body.errors).toBeUndefined();
        return response.body.data.chatThreads.map(
          ({ id }: { id: string }) => id,
        );
      };
      const changeShare = (enabled: boolean) =>
        makeMetadataApiRequest({
          query: SET_SHARE,
          variables: { target, principal, enabled },
        });
      try {
        const kickoff = await chatService.ensureHiddenKickoffMessage({
          userWorkspaceId: owner.userWorkspaceId,
          workspaceId,
          threadId,
          text: 'Private setup enrichment and workspace identity',
        });
        expect(kickoff.id).toBeDefined();
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: true,
          expectToFail: false,
        });
        expect((await read()).body.errors[0].extensions.code).toBe('NOT_FOUND');
        expect(await listedThreadIds()).not.toContain(threadId);
        expect((await changeShare(true)).body.errors).toBeUndefined();
        expect(await listedThreadIds()).toContain(threadId);
        const readable = await read();
        expect(readable.body.errors).toBeUndefined();
        expect(readable.body.data.chatThread.id).toBe(threadId);
        expect(readable.body.data.recordPermissions[0]).toMatchObject({
          permissions: {
            canRead: true,
            canUpdate: false,
            canDelete: false,
            canSoftDelete: false,
          },
        });
        const sharedMessages = await makeMetadataApiRequest(
          {
            query: parse(
              'query SharedMessages($threadId: UUID!) { chatMessages(threadId: $threadId) { id } }',
            ),
            variables: { threadId },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(sharedMessages.body.errors).toBeUndefined();
        expect(sharedMessages.body.data.chatMessages).toEqual([]);
        const audienceDetails = await makeMetadataApiRequest(
          {
            query:
              parse(`query SharingDetails($target: RecordSharingTargetInput!) {
            recordSharing(target: $target) { permissions { canRead canUpdate canDelete canSoftDelete } shares { principalId } roles { id } }
          }`),
            variables: { target },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(audienceDetails.body.data.recordSharing).toEqual({
          permissions: {
            canRead: true,
            canUpdate: false,
            canDelete: false,
            canSoftDelete: false,
          },
          shares: [],
          roles: [],
        });
        const rename = await makeMetadataApiRequest(
          {
            query: parse(
              `mutation RenameSharedThread($id: UUID!) { renameChatThread(id: $id, title: "Unauthorized rename") { id } }`,
            ),
            variables: { id: threadId },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(rename.body.errors[0].extensions.code).toBe('NOT_FOUND');
        const stop = await makeMetadataApiRequest(
          {
            query: parse(
              'mutation($id: UUID!) { stopAgentChatStream(threadId: $id) }',
            ),
            variables: { id: threadId },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(stop.body.errors[0].extensions.code).toBe('NOT_FOUND');
        const grantAsViewer = await makeMetadataApiRequest(
          {
            query: SET_SHARE,
            variables: { target, principal: { everyone: true }, enabled: true },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(grantAsViewer.body.errors[0].extensions.code).toBe('NOT_FOUND');
        const anonymous = await readThread(threadId, null);
        expect(anonymous.body.errors).toBeDefined();
        expect((await changeShare(false)).body.errors).toBeUndefined();
        expect(await listedThreadIds()).not.toContain(threadId);
        expect((await read()).body.errors[0].extensions.code).toBe('NOT_FOUND');
      } finally {
        await chatService.hardDeleteThread({ ...owner, threadId });
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: previousEnabled,
          expectToFail: false,
        });
      }
    },
  );

  it.each(['member', 'role', 'everyone'])(
    'executes as an invited %s editor and denies further work after downgrade',
    async (audience) => {
      const workspaceId = SEED_APPLE_WORKSPACE_ID;
      const cache = getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      );
      const { flatObjectMetadataMaps, userWorkspaceRoleMap, featureFlagsMap } =
        await cache.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'userWorkspaceRoleMap',
          'featureFlagsMap',
        ]);
      const previousEnabled =
        featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] === true;
      const owner = {
        workspaceId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      };
      const sender = {
        workspaceId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      };
      const principal =
        audience === 'member'
          ? { workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY }
          : audience === 'role'
            ? { roleId: userWorkspaceRoleMap[sender.userWorkspaceId] }
            : { everyone: true };
      const threadId = randomUUID();
      const target = {
        objectMetadataId:
          flatObjectMetadataMaps.byUniversalIdentifier[
            STANDARD_OBJECTS.agentChatThread.universalIdentifier
          ]!.id,
        recordId: threadId,
      };
      const chat =
        getAppProviderByClassName<AgentChatService>('AgentChatService');
      const actors = getAppProviderByClassName<AgentChatActorService>(
        'AgentChatActorService',
      );
      await chat.createThread({
        ...owner,
        id: threadId,
        title: 'Multiplayer regression',
      });
      try {
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: true,
          expectToFail: false,
        });
        const grant = (accessLevel: RecordShareAccessLevel) =>
          makeMetadataApiRequest({
            query: SET_SHARE,
            variables: { target, principal, enabled: true, accessLevel },
          });
        expect(
          (await grant(RecordShareAccessLevel.READ_WRITE)).body.errors,
        ).toBeUndefined();
        const readable = await readThread(
          threadId,
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(readable.body.errors).toBeUndefined();
        expect(readable.body.data.recordPermissions[0]).toMatchObject({
          permissions: {
            canRead: true,
            canUpdate: true,
            canDelete: false,
            canSoftDelete: false,
          },
        });
        const rename = await makeMetadataApiRequest(
          {
            query: parse(
              'mutation($id: UUID!) { renameChatThread(id: $id, title: "Edited together") { title } }',
            ),
            variables: { id: threadId },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(rename.body.errors).toBeUndefined();
        const stop = await makeMetadataApiRequest(
          {
            query: parse(
              'mutation($id: UUID!) { stopAgentChatStream(threadId: $id) }',
            ),
            variables: { id: threadId },
          },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(stop.body.errors).toBeUndefined();
        expect(stop.body.data.stopAgentChatStream).toBe(true);
        const changeSharingAsParticipant = (enabled: boolean) =>
          makeMetadataApiRequest(
            {
              query: SET_SHARE,
              variables: {
                target,
                principal: {
                  workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
                },
                enabled,
                accessLevel: RecordShareAccessLevel.READ,
              },
            },
            APPLE_JONY_MEMBER_ACCESS_TOKEN,
          );
        for (const enabled of [true, false]) {
          expect(
            (await changeSharingAsParticipant(enabled)).body.errors[0]
              .extensions.code,
          ).toBe('NOT_FOUND');
        }
        expect(
          (await grant(RecordShareAccessLevel.FULL)).body.errors,
        ).toBeUndefined();
        for (const enabled of [true, false]) {
          expect(
            (await changeSharingAsParticipant(enabled)).body.errors,
          ).toBeUndefined();
        }
        expect(
          (await grant(RecordShareAccessLevel.READ_WRITE)).body.errors,
        ).toBeUndefined();
        const queued = await chat.queueMessage({
          ...sender,
          threadId,
          text: 'Use my permissions',
        });
        const turnId = await chat.promoteQueuedMessage({
          workspaceId,
          threadId,
          messageId: queued.id,
        });
        const job = {
          ...sender,
          threadId,
          messageId: queued.id,
          turnId: turnId!,
        };
        await expect(actors.authorizeJob(job)).resolves.toMatchObject({
          sender: {
            userWorkspaceId: sender.userWorkspaceId,
            applicationId: null,
          },
        });
        await expect(
          actors.authorize({
            workspaceId,
            threadId,
            sender: {
              userWorkspaceId: sender.userWorkspaceId,
              applicationId: null,
            },
          }),
        ).resolves.toMatchObject({
          rolePermissionConfig: {
            intersectionOf: [userWorkspaceRoleMap[sender.userWorkspaceId]],
          },
        });
        await expect(
          actors.authorizeJob({
            ...job,
            userWorkspaceId: owner.userWorkspaceId,
          }),
        ).rejects.toMatchObject({ code: 'MESSAGE_NOT_FOUND' });
        expect(
          (await grant(RecordShareAccessLevel.READ)).body.errors,
        ).toBeUndefined();
        await expect(actors.authorizeJob(job)).rejects.toBeDefined();
        const downgraded = await readThread(
          threadId,
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(
          downgraded.body.data.recordPermissions[0].permissions.canUpdate,
        ).toBe(false);
      } finally {
        await chat.hardDeleteThread({ ...owner, threadId });
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: previousEnabled,
          expectToFail: false,
        });
      }
    },
  );

  it('retains ownership through upgrade rollback and retry, including flag-off and archived history', async () => {
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const chatService =
      getAppProviderByClassName<AgentChatService>('AgentChatService');
    const command = new EnableCommonRecordSharingCommand(
      {} as never,
      cache,
      getAppProviderByClassName<AgentHistoryStorageService>(
        'AgentHistoryUpgradeStorageService',
      ),
      getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      ),
      getAppProviderByClassName<BillingSubscriptionService>(
        'BillingSubscriptionService',
      ),
      global.testDataSource,
    );
    const workspaceId = SEED_APPLE_WORKSPACE_ID;
    const owner = {
      workspaceId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId: randomUUID(),
    };
    const options = { workspaceId, options: { dryRun: false } } as never;

    const originalFlag =
      (await cache.getOrRecompute(workspaceId, ['featureFlagsMap']))
        .featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] === true;
    await chatService.createThread({
      ...owner,
      id: owner.threadId,
      title: 'Upgrade ownership test',
    });
    try {
      await command.down(options);
      expect((await readThread(owner.threadId)).body.errors).toBeUndefined();
      await command.up(options);
      await command.up(options);
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
        value: false,
        expectToFail: false,
      });
      const readable = await readThread(owner.threadId);
      expect(readable.body.errors).toBeUndefined();
      expect(readable.body.data.recordPermissions[0].permissions).toEqual({
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canSoftDelete: true,
      });
      const archived = await chatService.archiveThread(owner);
      const retriedArchives = await Promise.all([
        chatService.archiveThread(owner),
        chatService.archiveThread(owner),
      ]);
      for (const retried of retriedArchives) {
        expect(retried.archivedAt).toEqual(archived.archivedAt);
        expect(retried.updatedAt).toEqual(archived.updatedAt);
      }
      expect(new Date(archived.archivedAt!).toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T/,
      );
      expect((await chatService.getWritableThread(owner)).archivedAt).toEqual(
        archived.archivedAt,
      );
      expect(
        (await chatService.getThreadsForMember(owner)).some(
          ({ id }) => id === owner.threadId,
        ),
      ).toBe(true);
      await chatService.unarchiveThread(owner);
      expect((await readThread(owner.threadId)).body.errors).toBeUndefined();
    } finally {
      await command.up(options);
      // The 2.43 command sets threads PRIVATE; later upgrades have moved them
      // on, so replay those to leave the workspace as other suites expect it.
      await getAppProviderByClassName<AddWorkflowRunToChatThreadsCommand>(
        'AddWorkflowRunToChatThreadsCommand',
      ).up(options);
      await chatService.hardDeleteThread(owner);

      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
        value: originalFlag,
        expectToFail: false,
      });
    }
  });
  it('lets non-owner writers rename through ordinary permissions and denies them after revocation', async () => {
    const workspaceId = SEED_APPLE_WORKSPACE_ID;
    const chat =
      getAppProviderByClassName<AgentChatService>('AgentChatService');
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const { flatObjectMetadataMaps } = await cache.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
    ]);
    const owner = {
      workspaceId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId: randomUUID(),
    };
    const writer = {
      ...owner,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    };
    await chat.createThread({
      ...owner,
      id: owner.threadId,
      title: 'Original',
    });
    const share = {
      objectMetadataId:
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ]!.id,
      recordId: owner.threadId,
      sourceId: owner.threadId,
      principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    };
    try {
      await setManualRecordShare({ workspaceId, share, enabled: true });
      expect(
        await chat.updateThreadTitle({
          ...writer,
          title: 'Collaborative rename',
        }),
      ).toMatchObject({
        title: 'Collaborative rename',
        workspaceMemberId: owner.workspaceMemberId,
      });
      const writerView = await readThread(
        owner.threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(writerView.body.errors).toBeUndefined();
      expect(writerView.body.data.recordPermissions[0]).toMatchObject({
        permissions: { canUpdate: true },
      });
      await expect(chat.getWritableThread(writer)).resolves.toMatchObject({
        id: owner.threadId,
      });
      await setManualRecordShare({ workspaceId, share, enabled: false });
      await expect(
        chat.updateThreadTitle({ ...writer, title: 'Revoked rename' }),
      ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
      expect(await chat.getWritableThread(owner)).toMatchObject({
        title: 'Collaborative rename',
      });
    } finally {
      await chat.hardDeleteThread(owner);
    }
  });

  it('rolls back creation when grant initialization fails', async () => {
    const chat =
      getAppProviderByClassName<AgentChatService>('AgentChatService');
    const shareService = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    const owner = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId: randomUUID(),
    };
    const cleanup = jest
      .spyOn(shareService, 'deleteByRecordIdsInTransaction')
      .mockRejectedValueOnce(new Error('Grant storage unavailable'));
    try {
      await expect(
        chat.createThread({ ...owner, id: owner.threadId }),
      ).rejects.toThrow('Grant storage unavailable');
    } finally {
      cleanup.mockRestore();
    }
    await expect(chat.getWritableThread(owner)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });

  it('stores the member owner and preserves the legacy API identity', async () => {
    const chat =
      getAppProviderByClassName<AgentChatService>('AgentChatService');
    const owner = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      threadId: randomUUID(),
    };
    await chat.createThread({ ...owner, id: owner.threadId });
    try {
      const response = await makeGraphqlApiRequest(
        findOneOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          gqlFields: 'id userWorkspaceId',
          filter: { id: { eq: owner.threadId } },
        }),
      );
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.agentChatThread).toEqual({
        id: owner.threadId,
        userWorkspaceId: owner.userWorkspaceId,
      });

      const rows: { workspaceMemberId: string; userWorkspaceId: string }[] =
        await global.testDataSource.query(
          `SELECT "workspaceMemberId", "userWorkspaceId" FROM ${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}."agentChatThread" WHERE id = $1`,
          [owner.threadId],
        );

      expect(rows).toEqual([
        {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        },
      ]);
    } finally {
      await chat.hardDeleteThread(owner);
    }
  });
});

describe('Conversations through the record API', () => {
  const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
  const readStoredThread = async (threadId: string) => {
    const rows: {
      workspaceMemberId: string | null;
      title: string | null;
      archivedAt: Date | null;
      activeStreamId: string | null;
    }[] = await global.testDataSource.query(
      `SELECT "workspaceMemberId", title, "archivedAt", "activeStreamId" FROM ${schema}."agentChatThread" WHERE id = $1`,
      [threadId],
    );
    return rows[0] ?? null;
  };
  const readShares = (threadId: string) =>
    global.testDataSource.query(
      `SELECT "principalId", "principalType", "accessLevel", "rowCause" FROM ${schema}."recordShare" WHERE "recordId" = $1`,
      [threadId],
    );
  const updateThread = (
    threadId: string,
    data: Record<string, unknown>,
    token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) =>
    makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'agentChatThread',
        gqlFields: 'id title archivedAt',
        recordId: threadId,
        data,
      }),
      token,
    );

  let previousRecordSharingEnabled = false;

  beforeAll(async () => {
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const { featureFlagsMap } = await cache.getOrRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['featureFlagsMap'],
    );
    previousRecordSharingEnabled =
      featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] === true;
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value: previousRecordSharingEnabled,
      expectToFail: false,
    });
  });

  it('creates, renames, archives and destroys a conversation only for its owner', async () => {
    const created = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'agentChatThread',
        gqlFields: 'id title',
        data: { title: 'Record API conversation' },
      }),
    );
    expect(created.body.errors).toBeUndefined();
    const threadId: string = created.body.data.createAgentChatThread.id;

    try {
      expect(await readStoredThread(threadId)).toMatchObject({
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        title: 'Record API conversation',
      });
      expect(await readShares(threadId)).toEqual([
        {
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
        },
      ]);

      const ownerView = await makeGraphqlApiRequest(
        findOneOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          gqlFields: 'id title',
          filter: { id: { eq: threadId } },
        }),
      );
      expect(ownerView.body.errors).toBeUndefined();
      expect(ownerView.body.data.agentChatThread).toEqual({
        id: threadId,
        title: 'Record API conversation',
      });

      const outsiderList = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          objectMetadataPluralName: 'agentChatThreads',
          gqlFields: 'id',
          filter: { id: { eq: threadId } },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(
        outsiderList.body.data?.agentChatThreads?.edges ?? [],
      ).toHaveLength(0);
      const outsiderView = await makeGraphqlApiRequest(
        findOneOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          gqlFields: 'id',
          filter: { id: { eq: threadId } },
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(outsiderView.body.data?.agentChatThread ?? null).toBeNull();
      const outsiderRename = await updateThread(
        threadId,
        { title: 'Unauthorized rename' },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(outsiderRename.body.errors).toBeDefined();

      const renamed = await updateThread(threadId, {
        title: 'Renamed through the record API',
      });
      expect(renamed.body.errors).toBeUndefined();
      expect(renamed.body.data.updateAgentChatThread.title).toBe(
        'Renamed through the record API',
      );

      // Stands in for a running turn, which archiving has to stop.
      await global.testDataSource.query(
        `UPDATE ${schema}."agentChatThread" SET "activeStreamId" = 'record-api-stream' WHERE id = $1`,
        [threadId],
      );
      const archived = await updateThread(threadId, {
        archivedAt: new Date().toISOString(),
      });
      expect(archived.body.errors).toBeUndefined();
      expect(
        archived.body.data.updateAgentChatThread.archivedAt,
      ).not.toBeNull();
      const archivedThread = await readStoredThread(threadId);
      expect(archivedThread?.archivedAt).not.toBeNull();
      expect(archivedThread?.activeStreamId).toBeNull();

      const unarchived = await updateThread(threadId, { archivedAt: null });
      expect(unarchived.body.errors).toBeUndefined();
      expect((await readStoredThread(threadId))?.archivedAt).toBeNull();

      const outsiderDestroy = await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          gqlFields: 'id',
          recordId: threadId,
        }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(outsiderDestroy.body.errors).toBeDefined();
      expect(await readStoredThread(threadId)).not.toBeNull();

      const destroyed = await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          gqlFields: 'id',
          recordId: threadId,
        }),
      );
      expect(destroyed.body.errors).toBeUndefined();
      expect(await readStoredThread(threadId)).toBeNull();
      expect(await readShares(threadId)).toHaveLength(1);
    } finally {
      await global.testDataSource.query(
        `DELETE FROM ${schema}."agentChatThread" WHERE id = $1`,
        [threadId],
      );
      await global.testDataSource.query(
        `DELETE FROM ${schema}."recordShare" WHERE "recordId" = $1`,
        [threadId],
      );
    }
  });

  const waitForDestroyedThread = (threadId: string) => {
    const eventEmitter = global.app.get(EventEmitter2, { strict: false });
    const eventName = computeEventName(
      'agentChatThread',
      DatabaseEventAction.DESTROYED,
    );

    return new Promise<WorkspaceEventBatch<ObjectRecordDestroyEvent>>(
      (resolve, reject) => {
        const listener = (
          batch: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
        ) => {
          if (batch.events.some((event) => event.recordId === threadId)) {
            clearTimeout(timeout);
            eventEmitter.off(eventName, listener);
            resolve(batch);
          }
        };
        const timeout = setTimeout(() => {
          eventEmitter.off(eventName, listener);
          reject(new Error(`No destroy event for conversation ${threadId}`));
        }, 10_000);

        eventEmitter.on(eventName, listener);
      },
    );
  };

  const isAdmittedByDestroyEvent = async ({
    batch,
    threadId,
    userWorkspaceId,
    workspaceMemberId,
  }: {
    batch: WorkspaceEventBatch<ObjectRecordDestroyEvent>;
    threadId: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
  }) => {
    const { userWorkspaceRoleMap, rolesPermissions } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'userWorkspaceRoleMap',
        'rolesPermissions',
      ]);
    const roleId = userWorkspaceRoleMap[userWorkspaceId];

    if (!isDefined(roleId)) {
      throw new Error(`Seeded role of ${userWorkspaceId} is missing`);
    }

    const admittedRecordIds =
      await getAppProviderByClassName<RecordAccessPolicyService>(
        'RecordAccessPolicyService',
      )
        .buildEventRecordAccessGate(batch)
        .resolveAdmittedRecordIds({
          isSystemContext: false,
          objectsPermissions: rolesPermissions[roleId],
          principalIds: [EVERYONE_PRINCIPAL_ID, workspaceMemberId, roleId],
          isOwningApplication: () => false,
          resolveRowLevelPermissionRecordFilter: () => null,
        });

    return admittedRecordIds.has(threadId);
  };

  it.each(['chat', 'record API'])(
    'delivers the destroy of a conversation through the %s to its owner and grantees only',
    async (api) => {
      const threadId = randomUUID();
      const owner = {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      };
      const chatService =
        getAppProviderByClassName<AgentChatService>('AgentChatService');
      const { flatObjectMetadataMaps } =
        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);

      await chatService.createThread({
        ...owner,
        id: threadId,
        title: 'Destroyed conversation audience',
      });

      try {
        await setManualRecordShare({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          enabled: true,
          share: {
            objectMetadataId:
              flatObjectMetadataMaps.byUniversalIdentifier[
                STANDARD_OBJECTS.agentChatThread.universalIdentifier
              ]!.id,
            recordId: threadId,
            sourceId: threadId,
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.READ,
          },
        });

        const destroyedEvent = waitForDestroyedThread(threadId);

        if (api === 'chat') {
          await chatService.hardDeleteThread({ ...owner, threadId });
        } else {
          const destroyed = await makeGraphqlApiRequest(
            destroyOneOperationFactory({
              objectMetadataSingularName: 'agentChatThread',
              gqlFields: 'id',
              recordId: threadId,
            }),
          );
          expect(destroyed.body.errors).toBeUndefined();
        }

        const batch = await destroyedEvent;

        expect(await readStoredThread(threadId)).toBeNull();
        expect(
          await isAdmittedByDestroyEvent({
            batch,
            threadId,
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          }),
        ).toBe(true);
        expect(
          await isAdmittedByDestroyEvent({
            batch,
            threadId,
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          }),
        ).toBe(true);
        expect(
          await isAdmittedByDestroyEvent({
            batch,
            threadId,
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          }),
        ).toBe(false);
      } finally {
        await global.testDataSource.query(
          `DELETE FROM ${schema}."agentChatThread" WHERE id = $1`,
          [threadId],
        );
        await global.testDataSource.query(
          `DELETE FROM ${schema}."recordShare" WHERE "recordId" = $1`,
          [threadId],
        );
      }
    },
  );
});
