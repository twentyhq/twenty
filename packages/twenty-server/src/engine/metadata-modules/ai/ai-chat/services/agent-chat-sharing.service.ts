import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { randomUUID } from 'node:crypto';
import { buildAgentChatThreadParticipantOwnerShareInsert } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-share-insert.util';
import { hasAgentChatThreadChannelField } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-agent-chat-thread-channel-field.util';
import { getAgentChatThreadParticipantTable } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-participant-table.util';
import { backfillWorkspaceChatThreadOwnerGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/backfill-workspace-chat-thread-owner-grants.util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, In, IsNull, Repository } from 'typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { buildRecordShareLockKey } from 'src/engine/permissions/record-share/utils/build-record-share-lock-key.util';
import { RecordShareException } from 'src/engine/permissions/record-share/record-share.exception';
import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';
import { RecordSharingWriteService } from 'src/engine/permissions/record-share/services/record-sharing-write.service';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { acquireAgentChatChannelGrantLocksForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks-for-thread-write-or-throw.util';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { buildAgentChatThreadParticipantOwnerShares } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-shares.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import { RecordSharingPermissionsService } from 'src/engine/permissions/record-sharing-permissions.service';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    private readonly recordSharingWriteService: RecordSharingWriteService,
    private readonly recordShareSystemWriteService: RecordShareSystemWriteService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordSharingPermissionsService: RecordSharingPermissionsService,
    private readonly principalPermissionsService: PrincipalPermissionsService,
    private readonly recordPermissionsService: RecordPermissionsService,
    private readonly settingPermissionsService: SettingPermissionsService,
    private readonly rolePermissionsService: RolePermissionsService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly channelGrantService: AgentChatChannelGrantService,
    @InjectWorkspaceScopedRepository(AgentChatChannelEntity)
    private readonly channelRepository: WorkspaceScopedRepository<AgentChatChannelEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly agentMessageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
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

  // TODO(@bosiraphael): remove once 2.54 leaves the cross-upgrade window
  async assertHasMentionResolutionOrThrow(workspaceId: string): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThreadParticipant.fields.mentionsResolvedAt
            .universalIdentifier
        ],
      )
    ) {
      throw new AiException(
        'Chats are not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_UPGRADE_IN_PROGRESS,
      );
    }
  }

  async getParticipantObjectMetadataId(workspaceId: string): Promise<string> {
    return (await this.getParticipantObjectMetadata(workspaceId)).id;
  }

  async getParticipantObjectMetadata(
    workspaceId: string,
  ): Promise<FlatObjectMetadata> {
    await this.assertHasMentionResolutionOrThrow(workspaceId);

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return (
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatThreadParticipant',
      ) ?? throwAgentChatThreadNotFound()
    );
  }

  private doesApplicationParticipateInThread({
    workspaceId,
    applicationId,
    threadId,
  }: {
    workspaceId: string;
    applicationId: string;
    threadId: string;
  }): Promise<boolean> {
    return this.agentMessageRepository.existsBy(workspaceId, {
      threadId,
      senderApplicationId: applicationId,
      senderWorkspaceMemberId: IsNull(),
    });
  }

  getReadableThread(args: AgentChatThreadAccessArgs) {
    return this.getThreadWithAccess({ ...args, operationType: 'read' });
  }

  async getThreadWithAccess({
    operationType,
    ...args
  }: AgentChatThreadAccessArgs & {
    operationType: ObjectRecordsOperationType;
  }) {
    const authContext = await this.getAuthContextOrThrow(args);
    const thread = await this.findThreadOrThrow(args);

    await this.assertOperationAllowedForCallerOrThrow({
      authContext,
      threadId: args.threadId,
      operationType,
    });

    return thread;
  }

  async getCallerWritableThreadOrThrow({
    authContext,
    threadId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    await this.assertCallerHasAiPermissionOrThrow(authContext);

    const workspaceId = authContext.workspace.id;
    const [thread, isApplicationParticipant] = await Promise.all([
      this.findThreadOrThrow({ workspaceId, threadId }),
      isApplicationAuthContext(authContext) &&
        this.doesApplicationParticipateInThread({
          workspaceId,
          applicationId: authContext.application.id,
          threadId,
        }),
    ]);

    if (!isApplicationParticipant) {
      await this.assertOperationAllowedForCallerOrThrow({
        authContext,
        threadId,
        operationType: 'update',
      });
    }

    return thread;
  }

  private async findThreadOrThrow({
    workspaceId,
    threadId,
  }: Pick<
    AgentChatThreadAccessArgs,
    'workspaceId' | 'threadId'
  >): Promise<AgentChatThreadWorkspaceEntity> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    return thread ?? throwAgentChatThreadNotFound();
  }

  private async assertOperationAllowedForCallerOrThrow({
    authContext,
    threadId,
    operationType,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
    operationType: ObjectRecordsOperationType;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.assertOperationAllowed(threadId, operationType),
      authContext,
    );
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

    const authContext = await this.getAuthContextOrThrow(args);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => [
        ...(await this.findThreadIdsGrantedForOperation({
          threadIds,
          operationType: 'read',
        })),
      ],
      authContext,
    );
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
      this.getAuthContextOrThrow({
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
      authContext: await this.getAuthContextOrThrow(args),
    };
    const sharing =
      await this.recordSharingPermissionsService.findRecordSharingPanel(
        recordTarget,
      );

    if (sharing.canManageSharing) {
      for (const memberId of chatMemberIds) {
        const memberShare = sharing.shares.find(
          ({ principalId }) => principalId === memberId,
        );

        if (EDIT_ACCESS_LEVELS.includes(memberShare?.accessLevel)) {
          continue;
        }

        // A member whose role cannot reach chats is refused the share
        await this.recordSharingWriteService
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

  async findEligibleParticipantWorkspaceMemberIds({
    memberIds,
    workspaceId,
    workspaceMemberId,
    threadId,
    shouldConsiderNewShares = true,
    transactionScope,
  }: AgentChatThreadAccessArgs & {
    memberIds: string[];
    shouldConsiderNewShares?: boolean;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<string[]> {
    const candidateMemberIds = [...new Set(memberIds)].filter(
      (memberId) => memberId !== workspaceMemberId,
    );

    if (!isNonEmptyArray(candidateMemberIds)) {
      return [];
    }

    const authContext = await this.getAuthContextOrThrow({
      workspaceId,
      workspaceMemberId,
    });
    const roleIdByMemberId = await this.findParticipantRoleIdsWithAiAccess({
      workspaceId,
      memberIds: candidateMemberIds,
    });

    if (roleIdByMemberId.size === 0) {
      return [];
    }

    const threadFlatObjectMetadata =
      await this.getThreadObjectMetadata(workspaceId);
    const canManageSharing =
      await this.recordSharingPermissionsService.canManageRecordSharing({
        objectMetadataId: threadFlatObjectMetadata.id,
        recordId: threadId,
        authContext,
        transactionScope,
      });

    const hypotheticalRecordShareAccessLevel =
      shouldConsiderNewShares && canManageSharing
        ? RecordShareAccessLevel.READ_WRITE
        : undefined;
    const replyingMemberIds = new Set(
      (
        await Promise.all(
          [...roleIdByMemberId.keys()].map(async (memberId) => {
            const principals =
              await this.principalPermissionsService.resolvePermissionsPrincipals(
                {
                  authContext: {
                    type: 'user',
                    workspace: { id: workspaceId },
                    workspaceMemberId: memberId,
                  },
                },
              );
            const question = {
              principals,
              objectMetadataId: threadFlatObjectMetadata.id,
              recordIds: [threadId],
              hypotheticalRecordShareAccessLevel,
              transactionScope,
            };
            const [canReadThread, canUpdateThread] = await Promise.all([
              this.recordPermissionsService.canAccessKnownRecords({
                ...question,
                operationType: 'read',
              }),
              this.recordPermissionsService.canAccessKnownRecords({
                ...question,
                operationType: 'update',
              }),
            ]);

            return canReadThread && canUpdateThread ? memberId : undefined;
          }),
        )
      ).filter(isDefined),
    );

    return candidateMemberIds.filter((memberId) =>
      replyingMemberIds.has(memberId),
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
    validateThread?: (args: {
      thread: AgentChatThreadWorkspaceEntity;
      transactionScope: WorkspaceTransactionScope;
    }) => Promise<void>;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const authContext = await this.getAuthContextOrThrow(args);
    const objectMetadata = await this.getThreadObjectMetadata(args.workspaceId);
    const participantObjectMetadata = await this.getParticipantObjectMetadata(
      args.workspaceId,
    );

    await this.validateThreadCreationIsPermitted({
      authContext,
      updatedColumns: isDefined(args.title) ? ['title'] : [],
    });

    return this.workspaceOrmManager.executeTransactionInWorkspaceContext(
      async (transactionScope) => {
        if (isDefined(args.channelId)) {
          await lockAgentChatChannelForThreadWriteOrThrow({
            transactionScope,
            channelRepository: this.channelRepository,
            workspaceId: args.workspaceId,
            channelId: args.channelId,
          });
        }
        await acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
          transactionScope,
          workspaceId: args.workspaceId,
          channelIds: [args.channelId],
        });
        const threadRepository =
          transactionScope.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
            'agentChatThread',
            { shouldSkipEventEmission: true },
          );
        const threadId = args.id ?? randomUUID();

        await threadRepository.insert({
          id: threadId,
          title: args.title ?? null,
          workspaceMemberId: authContext.workspaceMemberId,
          ...(isDefined(args.channelId) ? { channelId: args.channelId } : {}),
        });
        await this.recordShareSystemWriteService.setRecordsPrivacy({
          workspaceId: args.workspaceId,
          objectMetadataId: objectMetadata.id,
          recordIds: [threadId],
          isPrivate: true,
          transactionScope,
        });
        await this.recordShareSystemWriteService.deleteRecordSharesByRecordIds({
          workspaceId: args.workspaceId,
          objectMetadataId: objectMetadata.id,
          recordIds: [threadId],
          transactionScope,
        });
        await this.recordShareSystemWriteService.insertRecordShares({
          workspaceId: args.workspaceId,
          recordShares: [
            {
              objectMetadataId: objectMetadata.id,
              recordId: threadId,
              principalId: authContext.workspaceMemberId,
              principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
              accessLevel: RecordShareAccessLevel.FULL,
              rowCause: RecordShareRowCause.OWNER,
              sourceId: threadId,
            },
          ],
          transactionScope,
        });
        if (isDefined(args.channelId)) {
          await this.channelGrantService.replaceRuleGrantsInTransaction({
            transactionScope,
            workspaceId: args.workspaceId,
            scope: { threadIds: [threadId] },
          });
        }
        await this.setUpCreatedThreadsInboxState({
          transactionScope,
          workspaceId: args.workspaceId,
          workspaceMemberId: authContext.workspaceMemberId,
          threadIds: [threadId],
          participantObjectMetadata,
          isArchived: args.isArchived,
          isSubscribed: args.isSubscribed,
        });

        const createdThread =
          (await threadRepository.findOne({
            where: { id: threadId },
          })) ?? throwAgentChatThreadNotFound();

        await args.validateThread?.({
          thread: createdThread,
          transactionScope,
        });

        return createdThread;
      },
      buildSystemAuthContext(args.workspaceId),
      { lite: true },
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
          .getRepository('agentChatThread')
          .validateWriteIsPermitted({
            operationType: 'create',
            columnsToReturn: ['id'],
            updatedColumns,
          }),
      authContext,
    );
  }

  async claimUnownedThreadForRun(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadWorkspaceEntity | null> {
    const authContext = await this.getAuthContextOrThrow(args);

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
             INSERT INTO ${getAgentChatThreadParticipantTable(args.workspaceId)} ("threadId", "workspaceMemberId", "${IS_PRIVATE_COLUMN_NAME}", "lastReadAt", "isSubscribed")
             VALUES ($1, $2, true, clock_timestamp(), false)
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
    transactionScope,
    workspaceId,
    workspaceMemberId,
    threadIds,
    participantObjectMetadata,
    isArchived = false,
    isSubscribed = true,
  }: {
    transactionScope: WorkspaceTransactionScope;
    workspaceId: string;
    workspaceMemberId: string;
    threadIds: string[];
    participantObjectMetadata: FlatObjectMetadata;
    isArchived?: boolean;
    isSubscribed?: boolean;
  }): Promise<string[]> {
    const threadRepository =
      transactionScope.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
        'agentChatThread',
        { shouldSkipEventEmission: true },
      );
    const participantRepository =
      transactionScope.getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
        'agentChatThreadParticipant',
        { shouldSkipEventEmission: true },
      );
    const setUpAt = new Date().toISOString();

    const { generatedMaps: setUpThreads } = await threadRepository.update(
      { id: Any(threadIds), lastActivityAt: IsNull() },
      { lastActivityAt: setUpAt },
    );
    const setUpThreadIds: string[] = setUpThreads.map(({ id }) => id);

    if (!isNonEmptyArray(setUpThreadIds)) {
      return [];
    }

    const { identifiers: insertedParticipants } =
      await participantRepository.insert(
        setUpThreadIds.map((threadId) => ({
          threadId,
          workspaceMemberId,
          lastReadAt: setUpAt,
          archivedAt: isArchived ? setUpAt : null,
          isSubscribed,
        })),
        { onConflictDoNothing: true },
      );
    const insertedParticipantIds: string[] = insertedParticipants.map(
      ({ id }) => id,
    );

    await this.recordShareSystemWriteService.setRecordsPrivacy({
      workspaceId,
      objectMetadataId: participantObjectMetadata.id,
      recordIds: insertedParticipantIds,
      isPrivate: true,
      transactionScope,
    });

    await this.recordShareSystemWriteService.insertRecordShares({
      workspaceId,
      recordShares: buildAgentChatThreadParticipantOwnerShares({
        participants: insertedParticipantIds.map((id) => ({
          id,
          workspaceMemberId,
        })),
        objectMetadataId: participantObjectMetadata.id,
      }),
      transactionScope,
    });

    return setUpThreadIds;
  }

  async restoreThreadWithAccess(
    args: AgentChatThreadAccessArgs,
  ): Promise<AgentChatThreadWorkspaceEntity> {
    const authContext = await this.getAuthContextOrThrow(args);
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
            await this.assertOperationAllowed(args.threadId, 'softDelete');
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

  async getAuthContextOrThrow(
    args: Omit<AgentChatThreadAccessArgs, 'threadId'>,
  ) {
    const authContext = await this.userAuthContextService
      .resolveWorkspaceMember(args)
      .catch((error: unknown) => {
        if (error instanceof AuthException) {
          return throwAgentChatThreadNotFound();
        }
        throw error;
      });

    await this.assertCallerHasAiPermissionOrThrow(authContext);

    return authContext;
  }

  async assertCallerHasAiPermissionOrThrow(
    authContext: AgentInboxCallerAuthContext,
  ): Promise<void> {
    if (
      await this.settingPermissionsService.hasPermissionFlag({
        authContext,
        permissionFlag: PermissionFlagType.AI,
      })
    ) {
      return;
    }

    throwAgentChatThreadNotFound();
  }

  // must run inside the caller's workspace context
  private async assertOperationAllowed(
    threadId: string,
    operationType: ObjectRecordsOperationType,
  ): Promise<void> {
    const grantedThreadIds = await this.findThreadIdsGrantedForOperation({
      threadIds: [threadId],
      operationType,
    });
    if (grantedThreadIds.size !== 1) {
      throwAgentChatThreadNotFound();
    }
  }

  // must run inside the caller's workspace context, whose principals are already preloaded
  private findThreadIdsGrantedForOperation({
    threadIds,
    operationType,
  }: {
    threadIds: string[];
    operationType: ObjectRecordsOperationType;
  }): Promise<Set<string>> {
    const { permissionsPrincipals, objectIdByNameSingular } =
      getWorkspaceContext();

    return this.recordPermissionsService.filterAccessibleKnownRecordIds({
      principals: permissionsPrincipals,
      objectMetadataId: objectIdByNameSingular.agentChatThread,
      recordIds: threadIds,
      operationType,
    });
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

  private async findParticipantRoleIdsWithAiAccess({
    workspaceId,
    memberIds,
  }: {
    workspaceId: string;
    memberIds: string[];
  }): Promise<Map<string, string>> {
    const [
      roleIds,
      { flatWorkspaceMemberMaps, flatRoleMaps, flatRolePermissionFlagMaps },
    ] = await Promise.all([
      this.rolePermissionsService.findWorkspaceMemberRoleIds({
        workspaceId,
        workspaceMemberIds: memberIds,
      }),
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
      ]),
    ]);
    const activeUserIds = await this.findActiveUserIds({
      workspaceId,
      userIds: memberIds.flatMap((memberId) => {
        const userId = flatWorkspaceMemberMaps.byId[memberId]?.userId;

        return isDefined(userId) ? [userId] : [];
      }),
    });

    return new Map(
      memberIds.flatMap((memberId, index) => {
        const roleId = roleIds[index];
        const userId = flatWorkspaceMemberMaps.byId[memberId]?.userId;

        if (
          !isDefined(roleId) ||
          !isDefined(userId) ||
          !activeUserIds.has(userId)
        ) {
          return [];
        }

        const flatRole = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: roleId,
          flatEntityMaps: flatRoleMaps,
        });
        const hasAiAccess =
          isDefined(flatRole) &&
          isPermissionFlagGrantedToFlatRole({
            flatRole,
            permissionFlag: PermissionFlagType.AI,
            flatRolePermissionFlagMaps,
          });

        return hasAiAccess ? [[memberId, roleId] as const] : [];
      }),
    );
  }

  private async findActiveUserIds({
    workspaceId,
    userIds,
  }: {
    workspaceId: string;
    userIds: string[];
  }): Promise<Set<string>> {
    if (!isNonEmptyArray(userIds)) {
      return new Set();
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { workspaceId, userId: In(userIds) },
      relations: { user: true },
    });

    return new Set(
      userWorkspaces.flatMap(({ user, userId }) =>
        isDefined(user) && !user.disabled && !isDefined(user.deletedAt)
          ? [userId]
          : [],
      ),
    );
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
