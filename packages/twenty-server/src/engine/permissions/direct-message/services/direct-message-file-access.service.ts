import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { findDirectMessagePermissionObject } from 'src/engine/permissions/direct-message/utils/find-direct-message-permission-object.util';
import { findDirectMessageThreadPairs } from 'src/engine/permissions/direct-message/utils/find-direct-message-thread-pairs.util';
import { hasDirectMessageThreadIdentity } from 'src/engine/permissions/direct-message/utils/has-direct-message-thread-identity.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class DirectMessageFileAccessService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async assertFilesReadableOrThrow({
    workspaceId,
    fileIds,
    authContext = workspaceAuthContextStorage.getStore(),
  }: {
    workspaceId: string;
    fileIds: string[];
    authContext?: WorkspaceAuthContext;
  }): Promise<void> {
    const readableFileIds = await this.findReadableFileIds({
      workspaceId,
      fileIds,
      authContext,
    });

    if (fileIds.every((fileId) => readableFileIds.has(fileId))) {
      return;
    }

    throw new NotFoundError(doNotTranslate('File not found'), {
      userFriendlyMessage: msg`File not found.`,
    });
  }

  async findReadableFileIds({
    workspaceId,
    fileIds,
    authContext = workspaceAuthContextStorage.getStore(),
  }: {
    workspaceId: string;
    fileIds: string[];
    authContext?: WorkspaceAuthContext;
  }): Promise<Set<string>> {
    if (!isNonEmptyArray(fileIds)) {
      return new Set();
    }

    const protectedThreadIdsByFileId =
      await this.findProtectedThreadIdsByFileId({ workspaceId, fileIds });

    if (protectedThreadIdsByFileId.size === 0) {
      return new Set(fileIds);
    }

    if (
      !isDefined(authContext) ||
      authContext.workspace.id !== workspaceId ||
      isSystemAuthContext(authContext)
    ) {
      return new Set(
        fileIds.filter((fileId) => !protectedThreadIdsByFileId.has(fileId)),
      );
    }

    const readableThreadIds = new Set(
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<AgentChatThreadWorkspaceEntity>('agentChatThread')
            .findRecordIdsAllowedForOperation({
              recordIds: [
                ...new Set([...protectedThreadIdsByFileId.values()].flat()),
              ],
              operationType: 'select',
              withDeleted: true,
            }),
        authContext,
      ),
    );

    return new Set(
      fileIds.filter((fileId) => {
        const threadIds = protectedThreadIdsByFileId.get(fileId);

        return (
          !isDefined(threadIds) ||
          threadIds.some((threadId) => readableThreadIds.has(threadId))
        );
      }),
    );
  }

  private async findProtectedThreadIdsByFileId({
    workspaceId,
    fileIds,
  }: {
    workspaceId: string;
    fileIds: string[];
  }): Promise<Map<string, string[]>> {
    const { flatFieldMetadataMapsOrm, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMapsOrm',
        'featureFlagsMap',
      ]);
    const metadataMaps = {
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      featureFlagsMap,
    };

    if (
      !isDefined(
        findDirectMessagePermissionObject({
          metadataMaps,
          flatObjectMetadata: STANDARD_OBJECTS.agentChatThread,
        }),
      )
    ) {
      return new Map();
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const partRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<AgentMessagePartWorkspaceEntity>(
          'agentMessagePart',
        );
      const parts = await partRepository.find({
        where: { fileId: In([...new Set(fileIds)]) },
        select: { fileId: true, messageId: true },
        withDeleted: true,
      });

      if (!isNonEmptyArray(parts)) {
        return new Map<string, string[]>();
      }

      const messages = await this.workspaceOrmManager
        .getRepositoryWithoutPermissionChecks<AgentMessageWorkspaceEntity>(
          'agentMessage',
        )
        .find({
          where: {
            id: In([...new Set(parts.map(({ messageId }) => messageId))]),
          },
          select: { id: true, threadId: true },
          withDeleted: true,
        });
      const threadIdByMessageId = new Map(
        messages.map(({ id, threadId }) => [id, threadId]),
      );
      const threadIdsByFileId = new Map<string, string[]>();

      for (const { fileId, messageId } of parts) {
        const threadId = threadIdByMessageId.get(messageId);

        if (!isNonEmptyString(fileId) || !isNonEmptyString(threadId)) {
          continue;
        }

        threadIdsByFileId.set(fileId, [
          ...(threadIdsByFileId.get(fileId) ?? []),
          threadId,
        ]);
      }

      const pairs = await findDirectMessageThreadPairs({
        repository:
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
            'agentChatThread',
          ),
        metadataMaps,
        threadIds: [...new Set(messages.map(({ threadId }) => threadId))],
      });

      return new Map(
        [...threadIdsByFileId].filter(([, threadIds]) =>
          threadIds.some((threadId) => {
            const pair = pairs.get(threadId);

            return isDefined(pair) && hasDirectMessageThreadIdentity(pair);
          }),
        ),
      );
    }, buildSystemAuthContext(workspaceId));
  }
}
