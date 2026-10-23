import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { randomUUID } from 'node:crypto';
import { buildAgentChatThreadParticipantOwnerShareInsert } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-share-insert.util';
import { hasAgentChatThreadChannelField } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-agent-chat-thread-channel-field.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { backfillWorkspaceChatThreadOwnerGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/backfill-workspace-chat-thread-owner-grants.util';
import { Injectable } from '@nestjs/common';
import chunk from 'lodash.chunk';

import { PermissionFlagType } from 'twenty-shared/constants';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildRecordShareLockKey } from 'src/engine/core-modules/record-share/utils/build-record-share-lock-key.util';
import { RecordShareException } from 'src/engine/core-modules/record-share/record-share.exception';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { acquireAgentChatChannelGrantLocksForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks-for-thread-write-or-throw.util';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const READABLE_THREAD_IDS_BATCH_SIZE = 1000;

const EDIT_ACCESS_LEVELS: (RecordShareAccessLevel | null | undefined)[] = [
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.FULL,
];

@Injectable()
export class AgentChatSharingService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly userAuthContextService: UserWorkspaceAuthContextService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharingService: RecordSharingService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly channelGrantService: AgentChatChannelGrantService,
  ) {}

  // TODO(@FelixMalfait): remove once 2.51 leaves the cross-upgrade window. Until
  // the 2.51 channels command reaches a workspace, its chats have no channel column
  async hasChannels(workspaceId: string): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return hasAgentChatThreadChannelField({ flatFieldMetadataMaps });
  }

  async getParticipantObjectMetadataId(workspaceId: string): Promise<string> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return (
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatThreadParticipant',
      ) ?? throwAgentChatThreadNotFound()
    ).id;
  }

  getReadableThread(args: AgentChatThreadAccessArgs) {
    return this.getThreadWithAccess({ ...args, operationType: 'select' });
  }

  async getThreadWithAccess({
    operationType,
    ...args
  }: AgentChatThreadAccessArgs & {
    operationType: OperationType;
  }) {
    const authContext = await this.getAuthContext(args);
    const thread = await this.threadRepository.findOne(args.workspaceId, {
      where: { id: args.threadId },
    });
    if (!isDefined(thread)) {
      return throwAgentChatThreadNotFound();
    }
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.assertOperationAllowed(args.threadId, operationType),
      authContext,
    );
    return thread;
  }

  async findReadableThreadIds({
    threadIds,
    ...args
  }: Omit<AgentChatThreadAccessArgs, 'threadId'> & {
    threadIds: string[];
  }): Promise<string[]> {
    if (threadIds.length === 0) {
      return [];
    }

    const authContext = await this.getAuthContext(args);

    // Each id is a query parameter, so a long chat history is checked in
    // batches that stay well under PostgreSQL's parameter limit
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository =
        this.workspaceOrmManager.getRepositoryWithContextPermissions(
          'agentChatThread',
        );
      const readableThreadIds: string[] = [];

      for (const threadIdBatch of chunk(
        threadIds,
        READABLE_THREAD_IDS_BATCH_SIZE,
      )) {
        readableThreadIds.push(
          ...(await repository.findRecordIdsAllowedForOperation({
            recordIds: threadIdBatch,
            operationType: 'select',
            withDeleted: true,
          })),
        );
      }

      return readableThreadIds;
    }, authContext);
  }

  // Members join as editors so they can reply. Sharing is left to whoever may
  // manage it, so only the members who can reply afterwards are returned
  async shareThreadWithMembers({
    memberIds,
    ...args
  }: AgentChatThreadAccessArgs & {
    memberIds: string[];
  }): Promise<string[]> {
    const chatMemberIds = await this.filterMemberIds(memberIds, (memberId) =>
      this.getAuthContext({
        workspaceId: args.workspaceId,
        workspaceMemberId: memberId,
      }).then(() => true),
    );

    if (chatMemberIds.length === 0) {
      return [];
    }

    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    const recordTarget = {
      objectMetadataId: objectMetadata.id,
      recordId: args.threadId,
      authContext: await this.getAuthContext(args),
    };
    const sharing = await this.recordSharingService.getSharing(recordTarget);

    if (
      sharing.canManageSharing &&
      !EDIT_ACCESS_LEVELS.includes(sharing.generalAccessLevel)
    ) {
      for (const memberId of chatMemberIds) {
        const memberShare = sharing.shares.find(
          ({ principalId }) => principalId === memberId,
        );

        if (EDIT_ACCESS_LEVELS.includes(memberShare?.accessLevel)) {
          continue;
        }

        // A member whose role cannot reach chats is refused the share
        await this.recordSharingService
          .setShare({
            ...recordTarget,
            principal: { workspaceMemberId: memberId },
            accessLevel: RecordShareAccessLevel.READ_WRITE,
          })
          .catch((error: unknown) => {
            if (!(error instanceof RecordShareException)) {
              throw error;
            }
          });
      }
    }

    return this.filterMemberIds(chatMemberIds, (memberId) =>
      this.getThreadWithAccess({
        ...args,
        workspaceMemberId: memberId,
        operationType: 'update',
      }).then(() => true),
    );
  }

  async createThread(args: {
    workspaceId: string;
    workspaceMemberId: string;
    id?: string;
    title?: string;
    // filed under done for its owner, until activity brings it back to their inbox
    isArchived?: boolean;
    isSubscribed?: boolean;
    // checked by the caller, as the member must be able to reach it
    channelId?: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const authContext = await this.getAuthContext(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    const participantObjectMetadataId =
      await this.getParticipantObjectMetadataId(args.workspaceId);

    await this.validateThreadCreationIsPermitted({
      authContext,
      updatedColumns: isDefined(args.title) ? ['title'] : [],
    });

    return this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table }) => {
        if (isDefined(args.channelId)) {
          await lockAgentChatChannelForThreadWriteOrThrow({
            manager,
            workspaceId: args.workspaceId,
            channelId: args.channelId,
          });
        }
        await acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
          manager,
          workspaceId: args.workspaceId,
          channelIds: [args.channelId],
        });
        const records = await manager.query<AgentChatThreadWorkspaceEntity[]>(
          `INSERT INTO ${table('agentChatThread')} (id, title, "workspaceMemberId"${isDefined(args.channelId) ? ', "channelId"' : ''})
           VALUES ($1, $2, $3${isDefined(args.channelId) ? ', $4' : ''}) RETURNING *`,
          [
            args.id ?? randomUUID(),
            args.title ?? null,
            authContext.workspaceMemberId,
            ...(isDefined(args.channelId) ? [args.channelId] : []),
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
        if (isDefined(args.channelId)) {
          await this.channelGrantService.rewriteThreadGrantsInTransaction({
            manager,
            workspaceId: args.workspaceId,
            threadIds: [record.id],
            affectedChannelIds: [args.channelId],
          });
        }
        const [setUpRecord] = await this.setUpCreatedThreadsInboxState({
          manager,
          table,
          workspaceId: args.workspaceId,
          workspaceMemberId: authContext.workspaceMemberId,
          threadIds: [record.id],
          participantObjectMetadataId,
          isArchived: args.isArchived,
          isSubscribed: args.isSubscribed,
        });
        return setUpRecord ?? record;
      },
    );
  }

  private validateThreadCreationIsPermitted({
    authContext,
    updatedColumns,
  }: {
    authContext: UserWorkspaceAuthContext;
    updatedColumns: string[];
  }): Promise<void> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithContextPermissions('agentChatThread')
          .validateWriteIsPermitted({
            operationType: 'insert',
            columnsToReturn: ['id'],
            updatedColumns,
          }),
      authContext,
    );
  }

  async claimUnownedThreadForRun(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadWorkspaceEntity | null> {
    const authContext = await this.getAuthContext(args);

    await this.validateThreadCreationIsPermitted({
      authContext,
      updatedColumns: [],
    });

    const participantObjectMetadataId =
      await this.getParticipantObjectMetadataId(args.workspaceId);

    return this.threadRepository.query(
      args.workspaceId,
      async ({ manager, table }) => {
        const [thread] = await manager.query<AgentChatThreadWorkspaceEntity[]>(
          `WITH claimed_thread AS (
             UPDATE ${table('agentChatThread')}
             SET "workspaceMemberId" = $2,
                 "lastActivityAt" = COALESCE("lastActivityAt", clock_timestamp())
             WHERE id = $1
               AND "workspaceMemberId" IS NULL
               AND NOT EXISTS (
                 SELECT 1 FROM ${table('agentMessage')}
                 WHERE "threadId" = $1
                   AND role = $3
                   AND "senderWorkspaceMemberId" IS DISTINCT FROM $2
               )
             RETURNING *
           )
           SELECT * FROM claimed_thread`,
          [args.threadId, authContext.workspaceMemberId, AgentMessageRole.USER],
        );

        if (!isDefined(thread)) {
          return null;
        }

        const ownerGrantCount = await backfillWorkspaceChatThreadOwnerGrants({
          manager,
          workspaceId: args.workspaceId,
          threadTableExpression: table('agentChatThread'),
          recordIds: [thread.id],
        });

        if (ownerGrantCount !== 1) {
          throw new AiException(
            'Thread owner is no longer a workspace member',
            AiExceptionCode.THREAD_NOT_FOUND,
          );
        }
        await manager.query(
          `WITH participant AS (
             INSERT INTO ${getAgentChatThreadParticipantTable(args.workspaceId)} ("threadId", "workspaceMemberId", "lastReadAt", "isSubscribed")
             VALUES ($1, $2, clock_timestamp(), false)
             ON CONFLICT ("threadId", "workspaceMemberId") DO NOTHING
             RETURNING id, "workspaceMemberId"
           ), owner_share AS (
             ${buildAgentChatThreadParticipantOwnerShareInsert({
               workspaceId: args.workspaceId,
               participantSource: 'participant',
               objectMetadataIdParameter: '$3',
             })}
           )
           SELECT * FROM participant`,
          [
            thread.id,
            authContext.workspaceMemberId,
            participantObjectMetadataId,
          ],
        );

        return thread;
      },
    );
  }

  // A new thread sorts by its creation and starts read in its creator's
  // inbox. Threads already set up keep their state, so an upsert of an
  // existing thread through the record API cannot reset it.
  async setUpCreatedThreadsInboxState({
    manager,
    table,
    workspaceId,
    workspaceMemberId,
    threadIds,
    participantObjectMetadataId,
    isArchived = false,
    isSubscribed = true,
  }: AgentHistoryStorageContext & {
    workspaceId: string;
    workspaceMemberId: string;
    threadIds: string[];
    participantObjectMetadataId: string;
    isArchived?: boolean;
    isSubscribed?: boolean;
  }): Promise<AgentChatThreadWorkspaceEntity[]> {
    return manager.query<AgentChatThreadWorkspaceEntity[]>(
      `WITH thread AS (
         UPDATE ${table('agentChatThread')}
         SET "lastActivityAt" = clock_timestamp()
         WHERE id = ANY($1::uuid[]) AND "lastActivityAt" IS NULL
         RETURNING *
       ), participant AS (
         INSERT INTO ${getAgentChatThreadParticipantTable(workspaceId)} ("threadId", "workspaceMemberId", "lastReadAt", "archivedAt", "isSubscribed")
         SELECT thread.id, $2, thread."lastActivityAt", CASE WHEN $4::boolean THEN clock_timestamp() END, $5::boolean
         FROM thread
         ON CONFLICT ("threadId", "workspaceMemberId") DO NOTHING
         RETURNING id, "workspaceMemberId"
       ), owner_share AS (
         ${buildAgentChatThreadParticipantOwnerShareInsert({
           workspaceId,
           participantSource: 'participant',
           objectMetadataIdParameter: '$3',
         })}
       )
       SELECT * FROM thread`,
      [
        threadIds,
        workspaceMemberId,
        participantObjectMetadataId,
        isArchived,
        isSubscribed,
      ],
    );
  }

  async restoreThreadWithAccess(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    const authContext = await this.getAuthContext(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    // preloaded before reserving a core connection; sharing changes and domain writes then serialize on the same grant/record locks
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.threadRepository.query(
          args.workspaceId,
          async ({ manager, table }) => {
            // generic sharing's lock order, so revocations and writes cannot authorize against different snapshots
            await manager.query(
              'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
              [
                buildRecordShareLockKey({
                  workspaceId: args.workspaceId,
                  objectMetadataId: objectMetadata.id,
                  recordId: args.threadId,
                }),
              ],
            );
            const [thread] = await manager.query<
              AgentChatThreadWorkspaceEntity[]
            >(
              `SELECT * FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
              [args.threadId],
            );
            if (!isDefined(thread)) {
              return throwAgentChatThreadNotFound();
            }
            await this.assertOperationAllowed(args.threadId, 'restore');
            if (!isDefined(thread.deletedAt)) {
              return thread;
            }
            const [restoredThread] = await manager.query<
              AgentChatThreadWorkspaceEntity[]
            >(
              `WITH restored_thread AS (UPDATE ${table('agentChatThread')} SET "deletedAt" = NULL, "updatedAt" = NOW() WHERE id = $1 RETURNING *) SELECT * FROM restored_thread`,
              [args.threadId],
            );
            return restoredThread;
          },
        ),
      authContext,
    );
  }

  async getAuthContext(args: Omit<AgentChatThreadAccessArgs, 'threadId'>) {
    const authContext = await this.userAuthContextService
      .resolveWorkspaceMember(args)
      .catch((error: unknown) => {
        if (error instanceof AuthException) {
          return throwAgentChatThreadNotFound();
        }
        throw error;
      });
    if (
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId: args.workspaceId,
        userWorkspaceId: authContext.userWorkspaceId,
        setting: PermissionFlagType.AI,
        applicationId: authContext.application?.id,
        agentId: authContext.agentId,
      }))
    ) {
      return throwAgentChatThreadNotFound();
    }
    return authContext;
  }

  // must run inside the caller's workspace context
  private async assertOperationAllowed(
    threadId: string,
    operationType: OperationType,
  ): Promise<void> {
    const allowedIds = await this.workspaceOrmManager
      .getRepositoryWithContextPermissions('agentChatThread')
      .findRecordIdsAllowedForOperation({
        recordIds: [threadId],
        operationType,
        withDeleted: true,
      });
    if (allowedIds.length !== 1) {
      throwAgentChatThreadNotFound();
    }
  }

  private async filterMemberIds(
    memberIds: string[],
    isKept: (memberId: string) => Promise<boolean>,
  ): Promise<string[]> {
    const keptMemberIds = await Promise.all(
      memberIds.map(async (memberId) => {
        try {
          return (await isKept(memberId)) ? memberId : null;
        } catch (error) {
          if (
            error instanceof AiException &&
            error.code === AiExceptionCode.THREAD_NOT_FOUND
          ) {
            return null;
          }
          throw error;
        }
      }),
    );

    return keptMemberIds.filter(isDefined);
  }

  private async getThreadObjectMetadata(workspaceId: string) {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return (
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatThread',
      ) ?? throwAgentChatThreadNotFound()
    );
  }
}
