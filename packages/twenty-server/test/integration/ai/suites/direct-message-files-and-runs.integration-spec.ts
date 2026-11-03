import { randomUUID } from 'node:crypto';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';
import { In } from 'typeorm';

import { type UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type AgentChatQueueService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-queue.service';
import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { type DirectMessageFileAccessService } from 'src/engine/permissions/direct-message/services/direct-message-file-access.service';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Direct message file reuse privacy', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let fileAccessService: DirectMessageFileAccessService;
  let authContextService: UserWorkspaceAuthContextService;
  const fileIds = new Set<string>();
  let wasRecordSharingEnabled: boolean;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    fileAccessService =
      getAppProviderByClassName<DirectMessageFileAccessService>(
        'DirectMessageFileAccessService',
      );
    authContextService =
      getAppProviderByClassName<UserWorkspaceAuthContextService>(
        'UserWorkspaceAuthContextService',
      );

    wasRecordSharingEnabled = await context.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      context.workspaceId,
    );
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
    });
  });

  afterEach(async () => {
    await context.cleanup();
    await global.testDataSource
      .getRepository(FileEntity)
      .delete({ id: In([...fileIds]) });
    fileIds.clear();
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: wasRecordSharingEnabled,
    });
  });

  const createDirectMessage = async () => {
    const threadId = context.registerThread(
      await getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
        'AgentChatDirectMessageIdentityService',
      ).getOrCreate({
        workspaceId: context.workspaceId,
        firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      }),
    );

    await context.share({
      threadId,
      recipientWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      accessLevel: RecordShareAccessLevel.FULL,
    });

    return threadId;
  };

  const attachFile = async ({
    threadId,
    fileId,
  }: {
    threadId: string;
    fileId: string;
  }) => {
    const message = await context.saveMessage({ threadId });

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentMessagePart" SET "fileId" = $2, type = 'file' WHERE "messageId" = $1`,
      [message.id, fileId],
    );

    return message;
  };

  const createFile = async () => {
    const fileId = randomUUID();

    fileIds.add(fileId);
    await global.testDataSource.getRepository(FileEntity).save({
      id: fileId,
      workspaceId: context.workspaceId,
      path: `agent-chat/${fileId}.pdf`,
      status: FILE_STATUS.PENDING,
      mimeType: 'application/octet-stream',
      size: 1234,
    });

    return fileId;
  };

  it('hides deleted DM attachment references and rejects copying before upload status is disclosed', async () => {
    const threadId = await createDirectMessage();
    const fileId = await createFile();
    const message = await attachFile({ threadId, fileId });
    const authContext = await authContextService.resolveWorkspaceMember({
      workspaceId: context.workspaceId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentMessagePart" SET "deletedAt" = now() WHERE "messageId" = $1`,
      [message.id],
    );
    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentMessage" SET "deletedAt" = now() WHERE id = $1`,
      [message.id],
    );

    await expect(
      fileAccessService.assertFilesReadableOrThrow({
        workspaceId: context.workspaceId,
        fileIds: [fileId],
        authContext,
      }),
    ).rejects.toMatchObject({ extensions: { code: ErrorCode.NOT_FOUND } });
    await expect(
      getAppProviderByClassName<FilesFieldService>(
        'FilesFieldService',
      ).copyFileIntoFilesField({
        workspaceId: context.workspaceId,
        fileId,
        fieldMetadataId: randomUUID(),
        authContext,
      }),
    ).rejects.toMatchObject({ extensions: { code: ErrorCode.NOT_FOUND } });
    expect(
      await fileAccessService.findReadableFileIds({
        workspaceId: context.workspaceId,
        fileIds: [fileId],
        authContext,
      }),
    ).toEqual(new Set());
  });

  it('allows a DM member, rejects an outsider queueing the attachment, and allows an independently readable ordinary reference while preserving unreferenced uploads', async () => {
    const threadId = await createDirectMessage();
    const fileId = await createFile();

    await attachFile({ threadId, fileId });
    const memberContext = await authContextService.resolveWorkspaceMember({
      workspaceId: context.workspaceId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    await expect(
      fileAccessService.assertFilesReadableOrThrow({
        workspaceId: context.workspaceId,
        fileIds: [fileId],
        authContext: memberContext,
      }),
    ).resolves.toBeUndefined();

    const ordinaryThreadId = await context.createThread();

    await expect(
      getAppProviderByClassName<AgentChatQueueService>(
        'AgentChatQueueService',
      ).queueMessage({
        workspaceId: context.workspaceId,
        threadId: ordinaryThreadId,
        workspaceMemberId: context.workspaceMemberId,
        userWorkspaceId: context.userWorkspaceId,
        text: 'Forwarding the brief',
        fileAttachments: [{ id: fileId, filename: 'brief.pdf' }],
      }),
    ).rejects.toMatchObject({ extensions: { code: ErrorCode.NOT_FOUND } });

    await attachFile({ threadId: ordinaryThreadId, fileId });
    const outsiderContext = await authContextService.resolveWorkspaceMember({
      workspaceId: context.workspaceId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    await expect(
      fileAccessService.assertFilesReadableOrThrow({
        workspaceId: context.workspaceId,
        fileIds: [fileId, randomUUID()],
        authContext: outsiderContext,
      }),
    ).resolves.toBeUndefined();
  });
});
