import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { listChatThreadIds } from 'test/integration/utils/list-chat-thread-ids.util';
import { type AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type AddWorkflowRunToChatThreadsCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790607161319-add-workflow-run-to-chat-threads.command';
import { EnableCommonRecordSharingCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790312694997-enable-common-record-sharing.command';
import { type AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { randomUUID } from 'node:crypto';
import { parse } from 'graphql';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
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
// Chats are renamed, soft deleted, restored and destroyed through the record
// API like any other record
const updateThreadRecord = (
  threadId: string,
  data: Record<string, unknown>,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeGraphqlApiRequest(
    updateOneOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      gqlFields: 'id title deletedAt',
      recordId: threadId,
      data,
    }),
    token,
  );
const softDeleteThreadRecord = (
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeGraphqlApiRequest(
    deleteOneOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      gqlFields: 'id deletedAt',
      recordId: threadId,
    }),
    token,
  );
const restoreThreadRecord = (
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeGraphqlApiRequest(
    restoreOneOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      gqlFields: 'id deletedAt',
      recordId: threadId,
    }),
    token,
  );
const destroyThreadRecord = (
  threadId: string,
  token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN,
) =>
  makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName: 'agentChatThread',
      gqlFields: 'id',
      recordId: threadId,
    }),
    token,
  );
const readStoredThreadState = async (threadId: string) => {
  const rows: {
    title: string | null;
    deletedAt: Date | null;
  }[] = await global.testDataSource.query(
    `SELECT title, "deletedAt" FROM ${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}."agentChatThread" WHERE id = $1`,
    [threadId],
  );
  return rows[0] ?? null;
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
      const { userWorkspaceRoleMap, flatObjectMetadataMaps } =
        await cache.getOrRecompute(workspaceId, [
          'userWorkspaceRoleMap',
          'flatObjectMetadataMaps',
        ]);
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
      const listedThreadIds = () =>
        listChatThreadIds(APPLE_JONY_MEMBER_ACCESS_TOKEN);
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
        const storedBeforeViewerWrites = await readStoredThreadState(threadId);
        const viewerWrites = [
          await updateThreadRecord(
            threadId,
            { title: 'Unauthorized rename' },
            APPLE_JONY_MEMBER_ACCESS_TOKEN,
          ),
          await softDeleteThreadRecord(
            threadId,
            APPLE_JONY_MEMBER_ACCESS_TOKEN,
          ),
          await destroyThreadRecord(threadId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
        ];
        for (const viewerWrite of viewerWrites) {
          expect(viewerWrite.body.errors[0].extensions.code).toBe('NOT_FOUND');
        }
        expect(await readStoredThreadState(threadId)).toEqual(
          storedBeforeViewerWrites,
        );
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
        await destroyAgentChatThread({ threadId });
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
      const { flatObjectMetadataMaps, userWorkspaceRoleMap } =
        await cache.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'userWorkspaceRoleMap',
        ]);
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
        const rename = await updateThreadRecord(
          threadId,
          { title: 'Edited together' },
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(rename.body.errors).toBeUndefined();
        expect(rename.body.data.updateAgentChatThread.title).toBe(
          'Edited together',
        );
        const editorSoftDelete = await softDeleteThreadRecord(
          threadId,
          APPLE_JONY_MEMBER_ACCESS_TOKEN,
        );
        expect(editorSoftDelete.body.errors[0].extensions.code).toBe(
          'NOT_FOUND',
        );
        expect((await readStoredThreadState(threadId))?.deletedAt).toBeNull();
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
        await destroyAgentChatThread({ threadId });
      }
    },
  );

  it('retains ownership through upgrade rollback and retry, including soft deleted history', async () => {
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const chatService =
      getAppProviderByClassName<AgentChatService>('AgentChatService');
    const command = new EnableCommonRecordSharingCommand(
      {} as never,
      cache,
      getAppProviderByClassName<AgentHistoryUpgradeStorageService>(
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
      const readable = await readThread(owner.threadId);
      expect(readable.body.errors).toBeUndefined();
      expect(readable.body.data.recordPermissions[0].permissions).toEqual({
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canSoftDelete: true,
      });
      const softDeleted = await softDeleteThreadRecord(owner.threadId);
      expect(softDeleted.body.errors).toBeUndefined();
      const { deletedAt } = softDeleted.body.data.deleteAgentChatThread;
      expect(new Date(deletedAt).toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(
        (await chatService.getWritableThread(owner)).deletedAt,
      ).not.toBeNull();
      expect(await listChatThreadIds(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toContain(
        owner.threadId,
      );
      expect((await readThread(owner.threadId)).body.errors).toBeUndefined();
      const restoredTwice = await Promise.all([
        chatService.restoreThread(owner),
        chatService.restoreThread(owner),
      ]);
      for (const restored of restoredTwice) {
        expect(restored.deletedAt).toBeNull();
        expect(restored.updatedAt).toEqual(restoredTwice[0].updatedAt);
      }
      expect(
        (await readStoredThreadState(owner.threadId))?.deletedAt,
      ).toBeNull();
      expect((await readThread(owner.threadId)).body.errors).toBeUndefined();
    } finally {
      await command.up(options);
      // The 2.43 command sets threads PRIVATE; later upgrades have moved them
      // on, so replay those to leave the workspace as other suites expect it.
      await getAppProviderByClassName<AddWorkflowRunToChatThreadsCommand>(
        'AddWorkflowRunToChatThreadsCommand',
      ).up(options);
      await destroyAgentChatThread({ threadId: owner.threadId });
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
      const collaborativeRename = await updateThreadRecord(
        owner.threadId,
        { title: 'Collaborative rename' },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(collaborativeRename.body.errors).toBeUndefined();
      expect(await chat.getWritableThread(owner)).toMatchObject({
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
      const revokedRename = await updateThreadRecord(
        owner.threadId,
        { title: 'Revoked rename' },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(revokedRename.body.errors[0].extensions.code).toBe('NOT_FOUND');
      expect(await chat.getWritableThread(owner)).toMatchObject({
        title: 'Collaborative rename',
      });
    } finally {
      await destroyAgentChatThread({ threadId: owner.threadId });
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
      await destroyAgentChatThread({ threadId: owner.threadId });
    }
  });
});

describe('Conversations through the record API', () => {
  const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
  const readStoredThread = async (threadId: string) => {
    const rows: {
      workspaceMemberId: string | null;
      title: string | null;
      deletedAt: Date | null;
      archivedAt: Date | null;
      activeStreamId: string | null;
    }[] = await global.testDataSource.query(
      `SELECT "workspaceMemberId", title, "deletedAt", "archivedAt", "activeStreamId" FROM ${schema}."agentChatThread" WHERE id = $1`,
      [threadId],
    );
    return rows[0] ?? null;
  };
  const readShares = (threadId: string) =>
    global.testDataSource.query(
      `SELECT "principalId", "principalType", "accessLevel", "rowCause" FROM ${schema}."recordShare" WHERE "recordId" = $1`,
      [threadId],
    );
  it('reads a conversation with its relations even though its messages stay out of the API', async () => {
    const chat =
      getAppProviderByClassName<AgentChatService>('AgentChatService');
    const threadId = randomUUID();

    await chat.createThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: threadId,
      title: 'Conversation with hidden messages',
    });

    try {
      const response = await makeGraphqlApiRequest(
        findOneOperationFactory({
          objectMetadataSingularName: 'agentChatThread',
          gqlFields:
            'id title messages { edges { node { id } } } turns { edges { node { id } } }',
          filter: { id: { eq: threadId } },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.agentChatThread).toEqual({
        id: threadId,
        title: 'Conversation with hidden messages',
        messages: { edges: [] },
        turns: { edges: [] },
      });
    } finally {
      await destroyAgentChatThread({ threadId });
    }
  });

  it('creates, renames, soft deletes, restores and destroys a conversation only for its owner', async () => {
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
      const outsiderRename = await updateThreadRecord(
        threadId,
        { title: 'Unauthorized rename' },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(outsiderRename.body.errors).toBeDefined();

      const renamed = await updateThreadRecord(threadId, {
        title: 'Renamed through the record API',
      });
      expect(renamed.body.errors).toBeUndefined();
      expect(renamed.body.data.updateAgentChatThread.title).toBe(
        'Renamed through the record API',
      );

      // Archive is soft delete now; the legacy column is no longer writable
      const legacyArchive = await updateThreadRecord(threadId, {
        archivedAt: new Date().toISOString(),
      });
      expect(legacyArchive.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect((await readStoredThread(threadId))?.archivedAt).toBeNull();

      const outsiderSoftDelete = await softDeleteThreadRecord(
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(outsiderSoftDelete.body.errors[0].extensions.code).toBe(
        'NOT_FOUND',
      );
      expect((await readStoredThread(threadId))?.deletedAt).toBeNull();

      // Stands in for a running turn, which soft deleting has to stop.
      await global.testDataSource.query(
        `UPDATE ${schema}."agentChatThread" SET "activeStreamId" = 'record-api-stream' WHERE id = $1`,
        [threadId],
      );
      const softDeleted = await softDeleteThreadRecord(threadId);
      expect(softDeleted.body.errors).toBeUndefined();
      expect(
        softDeleted.body.data.deleteAgentChatThread.deletedAt,
      ).not.toBeNull();
      const softDeletedThread = await readStoredThread(threadId);
      expect(softDeletedThread?.deletedAt).not.toBeNull();
      expect(softDeletedThread?.archivedAt).toBeNull();
      expect(softDeletedThread?.activeStreamId).toBeNull();

      const outsiderRestore = await restoreThreadRecord(
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(outsiderRestore.body.errors[0].extensions.code).toBe('NOT_FOUND');
      expect((await readStoredThread(threadId))?.deletedAt).not.toBeNull();

      const restored = await restoreThreadRecord(threadId);
      expect(restored.body.errors).toBeUndefined();
      expect(restored.body.data.restoreAgentChatThread.deletedAt).toBeNull();
      expect((await readStoredThread(threadId))?.deletedAt).toBeNull();

      const outsiderDestroy = await destroyThreadRecord(
        threadId,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      expect(outsiderDestroy.body.errors).toBeDefined();
      expect(await readStoredThread(threadId)).not.toBeNull();

      const destroyed = await destroyThreadRecord(threadId);
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

  // The application exposes its events through WorkspaceEventEmitter, so the
  // destroy batch is captured there, as delivered to its subscribers.
  const waitForDestroyedThread = (threadId: string) => {
    const workspaceEventEmitter =
      getAppProviderByClassName<WorkspaceEventEmitter>('WorkspaceEventEmitter');
    const emitDatabaseBatchEvent =
      workspaceEventEmitter.emitDatabaseBatchEvent.bind(workspaceEventEmitter);

    return new Promise<WorkspaceEventBatch<ObjectRecordDestroyEvent>>(
      (resolve, reject) => {
        const emitSpy = jest
          .spyOn(workspaceEventEmitter, 'emitDatabaseBatchEvent')
          .mockImplementation((databaseBatchEventInput) => {
            emitDatabaseBatchEvent(databaseBatchEventInput);

            if (
              databaseBatchEventInput?.objectMetadataNameSingular !==
                'agentChatThread' ||
              databaseBatchEventInput.action !== DatabaseEventAction.DESTROYED
            ) {
              return;
            }

            const events =
              databaseBatchEventInput.events as ObjectRecordDestroyEvent[];

            if (events.some((event) => event.recordId === threadId)) {
              clearTimeout(timeout);
              emitSpy.mockRestore();
              resolve({
                name: computeEventName(
                  'agentChatThread',
                  DatabaseEventAction.DESTROYED,
                ),
                workspaceId: databaseBatchEventInput.workspaceId,
                objectMetadata: databaseBatchEventInput.objectMetadata,
                events,
              });
            }
          });
        const timeout = setTimeout(() => {
          emitSpy.mockRestore();
          reject(new Error(`No destroy event for conversation ${threadId}`));
        }, 10_000);
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
          canAccessAllRecords: false,
          isOwningApplication: () => false,
          resolveRowLevelPermissionRecordFilter: () => null,
        });

    return admittedRecordIds.has(threadId);
  };

  it.each([false, true])(
    'delivers the destroy of a conversation to its owner and grantees only (soft deleted first: %s)',
    async (isSoftDeletedFirst) => {
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

        if (isSoftDeletedFirst) {
          expect(
            (await softDeleteThreadRecord(threadId)).body.errors,
          ).toBeUndefined();
        }

        const destroyedEvent = waitForDestroyedThread(threadId);
        const destroyed = await destroyThreadRecord(threadId);
        expect(destroyed.body.errors).toBeUndefined();

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
