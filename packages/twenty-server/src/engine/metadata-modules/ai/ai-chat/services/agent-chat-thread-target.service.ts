import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { findAgentChatThreadTargetJoinColumnName } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-thread-target-join-column-name.util';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME = 'agentChatThreadTarget';

type RecordReference = {
  objectNameSingular: string;
  recordId: string;
};

type ThreadRecordArgs = RecordReference & {
  workspaceId: string;
  userWorkspaceId: string;
  threadId: string;
};

@Injectable()
export class AgentChatThreadTargetService {
  constructor(
    private readonly agentChatSharingService: AgentChatSharingService,
    private readonly agentHistoryStorageService: AgentHistoryStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async attachThreadToRecord(args: ThreadRecordArgs): Promise<void> {
    const joinColumnName = await this.resolveJoinColumnNameOrThrow(args);

    await this.assertThreadIsEditableOrThrow(args);
    await this.assertRecordIsReadableOrThrow(args);

    const link = { threadId: args.threadId, [joinColumnName]: args.recordId };

    await this.withTargetRepository(args.workspaceId, async (repository) => {
      // As on noteTarget, only the standard legs carry a unique index, so a
      // link to a custom object is deduplicated by looking for it first.
      if (await repository.existsBy(link)) {
        return;
      }

      await repository.insert(link, { onConflictDoNothing: true });
    });
  }

  async detachThreadFromRecord(args: ThreadRecordArgs): Promise<void> {
    const joinColumnName = await this.resolveJoinColumnNameOrThrow(args);

    await this.assertThreadIsEditableOrThrow(args);
    await this.assertRecordIsReadableOrThrow(args);

    await this.withTargetRepository(args.workspaceId, (repository) =>
      repository.delete({
        threadId: args.threadId,
        [joinColumnName]: args.recordId,
      }),
    );
  }

  // Resolving the record is the whole of the list path here: the attachment
  // predicate itself lives in the ranked thread query, so paging applies to the
  // ranked conversations rather than to an arbitrary prefix of the links.
  async resolveAuthorizedRecordOrThrow({
    workspaceId,
    objectNameSingular,
    recordId,
  }: RecordReference & { workspaceId: string }): Promise<string> {
    const joinColumnName = await this.resolveJoinColumnNameOrThrow({
      workspaceId,
      objectNameSingular,
    });

    await this.assertRecordIsReadableOrThrow({ objectNameSingular, recordId });

    return joinColumnName;
  }

  // Filing a conversation under a record changes the conversation, so it takes
  // the access renaming it does. A conversation the caller cannot edit reads as
  // not found, so no one can probe for conversations they do not share.
  private async assertThreadIsEditableOrThrow({
    workspaceId,
    userWorkspaceId,
    threadId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    threadId: string;
  }): Promise<void> {
    await this.agentChatSharingService.getThreadWithAccess({
      workspaceId,
      userWorkspaceId,
      threadId,
      operationType: 'update',
    });
  }

  // Targets are written in system context because the object is SYSTEM-writable,
  // so this lookup is the only point where the caller's own record grants are
  // consulted. It runs before the storage fence, which reserves a core pool
  // connection for the duration of the write.
  private async assertRecordIsReadableOrThrow({
    objectNameSingular,
    recordId,
  }: RecordReference): Promise<void> {
    const record = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const { authContext, userWorkspaceRoleMap, apiKeyRoleMap } =
          getWorkspaceContext();

        // The ORM does not fall back to the caller's role: with no config it
        // resolves to an empty permission map and no bypass, which denies
        // every object rather than consulting the grants this check exists for.
        const rolePermissionConfig = resolveRolePermissionConfig({
          authContext,
          userWorkspaceRoleMap,
          apiKeyRoleMap,
        });

        if (!isDefined(rolePermissionConfig)) {
          return null;
        }

        try {
          return await this.workspaceOrmManager
            .getRepository(objectNameSingular, rolePermissionConfig)
            .findOne({ where: { id: recordId }, select: { id: true } });
        } catch (error) {
          if (
            error instanceof PermissionsException &&
            error.code === PermissionsExceptionCode.PERMISSION_DENIED
          ) {
            return null;
          }

          throw error;
        }
      },
    );

    // Not-found rather than forbidden, so a member cannot probe for records
    // outside their grants.
    if (!isDefined(record)) {
      throw new AiException(
        'Record not found',
        AiExceptionCode.RECORD_NOT_FOUND,
      );
    }
  }

  private async resolveJoinColumnNameOrThrow({
    workspaceId,
    objectNameSingular,
  }: {
    workspaceId: string;
    objectNameSingular: string;
  }): Promise<string> {
    if (!isNonEmptyString(objectNameSingular)) {
      throw new AiException(
        'An object name is required to attach a conversation to a record',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const objectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName: objectNameSingular,
    });

    if (!isDefined(objectMetadataId)) {
      throw new AiException(
        `Unknown object "${objectNameSingular}"`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const joinColumnName = findAgentChatThreadTargetJoinColumnName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectMetadataId,
    });

    if (!isDefined(joinColumnName)) {
      throw new AiException(
        `Conversations cannot be attached to ${objectNameSingular} records`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return joinColumnName;
  }

  private withTargetRepository<TResult>(
    workspaceId: string,
    work: (repository: WorkspaceRepository<ObjectRecord>) => Promise<TResult>,
  ): Promise<TResult> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        // A target's foreign key points at the workspace-schema thread table, so
        // a workspace whose history still routes to core has nothing to attach
        // to. Holding the storage fence keeps the route from flipping mid-write.
        this.agentHistoryStorageService.run(workspaceId, async (context) => {
          if (context.storage !== 'workspace') {
            throw new AiException(
              'AI history has not been migrated to this workspace yet',
              AiExceptionCode.INVALID_AGENT_INPUT,
            );
          }

          return work(
            this.workspaceOrmManager.getRepository(
              AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME,
              { shouldBypassPermissionChecks: true },
              { shouldSkipEventEmission: true },
            ),
          );
        }),
      buildSystemAuthContext(workspaceId),
    );
  }
}
