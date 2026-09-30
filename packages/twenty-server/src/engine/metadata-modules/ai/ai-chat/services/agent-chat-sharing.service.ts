import { lockAgentChatThread } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-thread.util';
import { IsNull } from 'typeorm';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { randomUUID } from 'node:crypto';
import { backfillWorkspaceChatThreadOwnerGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/backfill-workspace-chat-thread-owner-grants.util';
import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { type RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { hasWorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-history/utils/has-workflow-run-thread-fields.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const MAX_CHAT_THREADS = 1000;

type ThreadAccessArgs = {
  workspaceId: string;
  workspaceMemberId: string;
  threadId: string;
};

@Injectable()
export class AgentChatSharingService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
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
    const allowedIds = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithContextPermissions('agentChatThread')
          .findRecordIdsAllowedForOperation({
            recordIds: [args.threadId],
            operationType,
            updatedColumns,
            withDeleted: true,
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
    return this.recordSharingService.getPermissionsForRecords({
      authContext,
      objectMetadataId: objectMetadata.id,
      recordIds: args.threadIds,
      withDeleted: true,
    });
  }

  async getReadableThreadIds(
    args: Omit<ThreadAccessArgs, 'threadId'>,
  ): Promise<string[]> {
    const authContext = await this.getAuthContext(args);
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(args.workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const records = await this.workspaceOrmManager
        .getRepositoryWithContextPermissions('agentChatThread')
        .find({
          // Anyone who reads a run reads its agent's conversations, so without
          // this every run would crowd into every member's own chats.
          where: hasWorkflowRunThreadFields(flatFieldMetadataMaps)
            ? { workflowRunId: IsNull() }
            : undefined,
          select: { id: true },
          withDeleted: true,
          order: { updatedAt: 'DESC', id: 'DESC' },
          take: MAX_CHAT_THREADS,
        });
      return records.map(({ id }) => id);
    }, authContext);
  }

  async createThread(args: {
    workspaceId: string;
    workspaceMemberId: string;
    id?: string;
    title?: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const authContext = await this.getAuthContext(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);

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

    return this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table }) => {
        const records = await manager.query<AgentChatThreadWorkspaceEntity[]>(
          `INSERT INTO ${table('agentChatThread')} (id, title, "workspaceMemberId", "userWorkspaceId")
         VALUES ($1, $2, $3, $4) RETURNING *`,
          [
            args.id ?? randomUUID(),
            args.title ?? null,
            authContext.workspaceMemberId,
            authContext.userWorkspaceId,
          ],
        );
        const record = records[0];
        await this.recordShareStorageService.deleteByRecordIdsInTransaction({
          workspaceId: args.workspaceId,
          objectMetadataId: objectMetadata.id,
          recordIds: [record.id],
          manager,
        });
        const ownerGrantCount = await backfillWorkspaceChatThreadOwnerGrants({
          manager,
          workspaceId: args.workspaceId,
          threadTableExpression: table('agentChatThread'),
          recordIds: [record.id],
        });
        if (ownerGrantCount !== 1) {
          throw new AiException(
            'Thread owner is no longer a workspace member',
            AiExceptionCode.THREAD_NOT_FOUND,
          );
        }
        return record;
      },
    );
  }

  async restoreThreadWithAccess(
    args: ThreadAccessArgs,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    return this.mutateThreadWithAccess({
      ...args,
      operationType: 'restore',
      updatedColumns: [],
      mutate: async ({ manager, table }, thread) => {
        if (!isDefined(thread.deletedAt)) {
          return thread;
        }
        const records = await manager.query<AgentChatThreadWorkspaceEntity[]>(
          `WITH restored_thread AS (UPDATE ${table('agentChatThread')} SET "deletedAt" = NULL, "updatedAt" = NOW() WHERE id = $1 RETURNING *) SELECT * FROM restored_thread`,
          [args.threadId],
        );
        const record = records[0];
        if (!isDefined(record)) {
          return this.throwNotFound();
        }
        return record;
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
      thread: AgentChatThreadWorkspaceEntity,
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
          const allowedIds = await this.workspaceOrmManager
            .getRepositoryWithContextPermissions('agentChatThread')
            .findRecordIdsAllowedForOperation({
              recordIds: [args.threadId],
              operationType,
              updatedColumns,
              withDeleted: true,
            });
          if (allowedIds.length !== 1) {
            return this.throwNotFound();
          }

          return mutate(context, thread);
        }),
      authContext,
    );
  }

  async getAuthContext(args: Omit<ThreadAccessArgs, 'threadId'>) {
    const authContext = await this.userAuthContextService
      .resolveWorkspaceMember(args)
      .catch((error: unknown) => {
        if (error instanceof AuthException) {
          return this.throwNotFound();
        }
        throw error;
      });
    if (
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId: args.workspaceId,
        userWorkspaceId: authContext.userWorkspaceId,
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
