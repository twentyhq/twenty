import { lockAgentChatThread } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-thread.util';
import { In } from 'typeorm';
import { mapAgentHistoryFieldNameToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/map-agent-history-field-name-to-workspace.util';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { randomUUID } from 'node:crypto';
import { backfillChatThreadOwnerGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/backfill-chat-thread-owner-grants.util';
import { normalizeAgentHistoryRecord } from 'src/engine/metadata-modules/ai/ai-history/utils/normalize-agent-history-record.util';
import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { type RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { buildWorkspaceMemberIdFromUserWorkspaceIdSql } from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-chat-thread-owner-sql.util';
import { getAgentChatThreadOwnerColumns } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-columns.util';

const MAX_CHAT_THREADS = 1000;

type ThreadAccessArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  threadId: string;
};

@Injectable()
export class AgentChatSharingService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    private readonly userAuthContextService: UserWorkspaceAuthContextService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly permissionsService: PermissionsService,
    private readonly recordSharingService: RecordSharingService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  getReadableThread(args: ThreadAccessArgs) {
    return this.getThreadWithAccess({ ...args, operationType: 'select' });
  }

  async getThreadWithAccess({
    operationType,
    updatedColumns = [],
    ...args
  }: ThreadAccessArgs & {
    operationType: OperationType;
    updatedColumns?: string[];
  }) {
    const authContext = await this.getAuthContext(args);
    const thread = await this.threadRepository.findOne(args.workspaceId, {
      where: { id: args.threadId },
    });
    if (!isDefined(thread)) {
      return this.throwNotFound();
    }
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    // Old core history remains owner-only until the workspace upgrade installs
    // ownership grants and switches the metadata to the common private policy.
    if (objectMetadata.readability === MetadataReadability.SYSTEM) {
      if (thread.userWorkspaceId !== args.userWorkspaceId) {
        return this.throwNotFound();
      }
      return thread;
    }
    const allowedIds = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithContextPermissions('agentChatThread')
          .findRecordIdsAllowedForOperation({
            recordIds: [args.threadId],
            operationType,
            updatedColumns,
            withDeleted: false,
          }),
      authContext,
    );
    if (allowedIds.length !== 1) {
      return this.throwNotFound();
    }
    return thread;
  }

  async getPermissions(args: ThreadAccessArgs): Promise<RecordPermissionsDTO> {
    const permissions = await this.getPermissionsForThreads({
      ...args,
      threadIds: [args.threadId],
    });
    return permissions.get(args.threadId)!;
  }

  async getPermissionsForThreads(
    args: Omit<ThreadAccessArgs, 'threadId'> & { threadIds: string[] },
  ) {
    const authContext = await this.getAuthContext(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    if (objectMetadata.readability === MetadataReadability.SYSTEM) {
      const ownedThreads = await this.threadRepository.find(args.workspaceId, {
        where: {
          id: In(args.threadIds),
          userWorkspaceId: args.userWorkspaceId,
        },
        select: ['id'],
      });
      const ownedThreadIds = new Set(ownedThreads.map(({ id }) => id));
      return new Map(
        args.threadIds.map((threadId) => {
          const isOwner = ownedThreadIds.has(threadId);
          return [
            threadId,
            {
              canRead: isOwner,
              canUpdate: isOwner,
              canDelete: isOwner,
              canSoftDelete: isOwner,
            },
          ] as const;
        }),
      );
    }
    return this.recordSharingService.getPermissionsForRecords({
      authContext,
      objectMetadataId: objectMetadata.id,
      recordIds: args.threadIds,
      withDeleted: false,
    });
  }

  async getReadableThreadIds(
    args: Omit<ThreadAccessArgs, 'threadId'>,
  ): Promise<string[]> {
    const authContext = await this.getAuthContext(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    if (objectMetadata.readability === MetadataReadability.SYSTEM) {
      return (
        await this.threadRepository.find(args.workspaceId, {
          where: { userWorkspaceId: args.userWorkspaceId },
          select: ['id'],
          order: { updatedAt: 'DESC', id: 'DESC' },
          take: MAX_CHAT_THREADS,
        })
      ).map(({ id }) => id);
    }
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const records = await this.workspaceOrmManager
        .getRepositoryWithContextPermissions('agentChatThread')
        .find({
          select: { id: true },
          withDeleted: false,
          order: { updatedAt: 'DESC', id: 'DESC' },
          take: MAX_CHAT_THREADS,
        });
      return records.map(({ id }) => id);
    }, authContext);
  }

  async createThread(args: {
    workspaceId: string;
    userWorkspaceId: string;
    id?: string;
    title?: string;
  }): Promise<AgentChatThreadEntity> {
    const authContext = await this.getAuthContext(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    if (objectMetadata.readability !== MetadataReadability.SYSTEM) {
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions('agentChatThread')
            .validateWriteIsPermitted({
              operationType: 'insert',
              columnsToReturn: ['id'],
              updatedColumns: isDefined(args.title) ? ['title'] : [],
            }),
        authContext,
      );
    }
    return this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table, storage }) => {
        const ownerColumns =
          storage === 'core'
            ? {
                hasUserWorkspaceIdColumn: true,
                hasWorkspaceMemberIdColumn: false,
              }
            : await getAgentChatThreadOwnerColumns({
                manager,
                workspaceId: args.workspaceId,
              });
        // Both columns exist only while the 2.43 upgrade runs; fill both so the
        // legacy column stays complete until it is dropped.
        const ownerColumnsSql = [
          ...(ownerColumns.hasUserWorkspaceIdColumn
            ? ['"userWorkspaceId"']
            : []),
          ...(ownerColumns.hasWorkspaceMemberIdColumn
            ? ['"workspaceMemberId"']
            : []),
        ];
        const ownerValuesSql = [
          ...(ownerColumns.hasUserWorkspaceIdColumn ? ['$3::uuid'] : []),
          ...(ownerColumns.hasWorkspaceMemberIdColumn
            ? [
                buildWorkspaceMemberIdFromUserWorkspaceIdSql({
                  workspaceId: args.workspaceId,
                  userWorkspaceIdSql: '$3::uuid',
                }),
              ]
            : []),
        ];
        const records = await manager.query<AgentChatThreadEntity[]>(
          `INSERT INTO ${table('agentChatThread')} (id, title, ${ownerColumnsSql.join(', ')}${storage === 'core' ? ', "workspaceId"' : ''})
         VALUES ($1, $2, ${ownerValuesSql.join(', ')}${storage === 'core' ? ', $4' : ''}) RETURNING *`,
          [
            args.id ?? randomUUID(),
            args.title ?? null,
            args.userWorkspaceId,
            ...(storage === 'core' ? [args.workspaceId] : []),
          ],
        );
        const record = { ...records[0], userWorkspaceId: args.userWorkspaceId };
        await this.recordShareStorageService.deleteByRecordIdsInTransaction({
          workspaceId: args.workspaceId,
          objectMetadataId: objectMetadata.id,
          recordIds: [record.id],
          manager,
        });
        const ownerGrantCount = await backfillChatThreadOwnerGrants({
          manager,
          workspaceId: args.workspaceId,
          threadTableExpression: table('agentChatThread'),
          isCoreStorage: storage === 'core',
          recordIds: [record.id],
        });
        if (ownerGrantCount !== 1) {
          throw new AiException(
            'Thread owner is no longer a workspace member',
            AiExceptionCode.THREAD_NOT_FOUND,
          );
        }
        return storage === 'core'
          ? record
          : (normalizeAgentHistoryRecord({
              record,
              workspaceId: args.workspaceId,
              objectName: 'agentChatThread',
            }) as AgentChatThreadEntity);
      },
    );
  }

  async updateThreadWithAccess({
    operationType,
    changes,
    ...args
  }: ThreadAccessArgs & {
    operationType: 'update' | 'soft-delete' | 'restore';
    changes:
      | { title: string }
      | { deletedAt: Date | null; activeStreamId?: null };
  }): Promise<AgentChatThreadEntity> {
    return this.mutateThreadWithAccess({
      ...args,
      operationType,
      updatedColumns: operationType === 'update' ? Object.keys(changes) : [],
      mutate: async ({ manager, table, storage }, thread) => {
        if (operationType === 'soft-delete' && isDefined(thread.deletedAt)) {
          return thread;
        }
        const entries = Object.entries(changes).map(
          ([fieldName, value]) =>
            [
              storage === 'workspace'
                ? mapAgentHistoryFieldNameToWorkspace(
                    'agentChatThread',
                    fieldName,
                  )
                : fieldName,
              value,
            ] as const,
        );
        const records = await manager.query<AgentChatThreadEntity[]>(
          `WITH updated_thread AS (UPDATE ${table('agentChatThread')} SET ${entries.map(([key], index) => `${escapeIdentifier(key)} = $${index + 2}`).join(', ')}, "updatedAt" = NOW() WHERE id = $1 RETURNING *) SELECT * FROM updated_thread`,
          [args.threadId, ...entries.map(([, value]) => value)],
        );
        const record = records[0];
        if (!isDefined(record)) {
          return this.throwNotFound();
        }
        return storage === 'core'
          ? record
          : (normalizeAgentHistoryRecord({
              record,
              workspaceId: args.workspaceId,
              objectName: 'agentChatThread',
            }) as AgentChatThreadEntity);
      },
    });
  }

  async deleteThreadWithShares(args: ThreadAccessArgs): Promise<boolean> {
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    return this.mutateThreadWithAccess({
      ...args,
      operationType: 'delete',
      updatedColumns: [],
      mutate: async ({ manager, table }) => {
        const deleted = await manager.query<{ id: string }[]>(
          `WITH deleted_thread AS (DELETE FROM ${table('agentChatThread')} WHERE id = $1 RETURNING id) SELECT id FROM deleted_thread`,
          [args.threadId],
        );
        await this.recordShareStorageService.deleteByRecordIdsInTransaction({
          workspaceId: args.workspaceId,
          objectMetadataId: objectMetadata.id,
          recordIds: [args.threadId],
          manager,
        });
        return deleted.length === 1;
      },
    });
  }

  private async mutateThreadWithAccess<TResult>({
    operationType,
    updatedColumns,
    mutate,
    ...args
  }: ThreadAccessArgs & {
    operationType: OperationType;
    updatedColumns: string[];
    mutate: (
      context: AgentHistoryStorageContext,
      thread: AgentChatThreadEntity,
    ) => Promise<TResult>;
  }): Promise<TResult> {
    const authContext = await this.getAuthContext(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    // Preload the workspace context before reserving a core connection. Sharing
    // changes and domain writes then serialize on the same grant/record locks.
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.threadRepository.query(args.workspaceId, async (context) => {
          const thread = await lockAgentChatThread({
            context,
            workspaceId: args.workspaceId,
            objectMetadataId: objectMetadata.id,
            threadId: args.threadId,
          });
          if (
            objectMetadata.readability === MetadataReadability.SYSTEM &&
            thread.userWorkspaceId !== args.userWorkspaceId
          ) {
            return this.throwNotFound();
          }
          if (objectMetadata.readability !== MetadataReadability.SYSTEM) {
            const allowedIds = await this.workspaceOrmManager
              .getRepositoryWithContextPermissions('agentChatThread')
              .findRecordIdsAllowedForOperation({
                recordIds: [args.threadId],
                operationType,
                updatedColumns,
                withDeleted: false,
              });
            if (allowedIds.length !== 1) {
              return this.throwNotFound();
            }
          }
          return mutate(context, thread);
        }),
      authContext,
    );
  }

  private async getAuthContext(args: Omit<ThreadAccessArgs, 'threadId'>) {
    const authContext = await this.userAuthContextService
      .resolve(args)
      .catch((error: unknown) => {
        if (error instanceof AuthException) {
          return this.throwNotFound();
        }
        throw error;
      });
    if (
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        ...args,
        setting: PermissionFlagType.AI,
        applicationId: authContext.application?.id,
      }))
    ) {
      return this.throwNotFound();
    }
    return authContext;
  }

  private async getThreadObjectMetadata(workspaceId: string) {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const objectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    if (!isDefined(objectMetadata)) {
      return this.throwNotFound();
    }
    return objectMetadata;
  }

  private throwNotFound(): never {
    throw new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
  }
}
