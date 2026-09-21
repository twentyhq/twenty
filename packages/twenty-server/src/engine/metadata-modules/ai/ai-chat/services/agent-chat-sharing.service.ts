import { isNonEmptyString } from '@sniptt/guards';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  EVERYONE_PRINCIPAL_ID,
  PermissionFlagType,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { RecordShareService } from 'src/engine/core-modules/record-share/services/record-share.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-share-with-principal-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/core-modules/record-share/utils/validate-share-with-principals-or-throw.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly recordShareService: RecordShareService,
    private readonly sharingFeatureService: RecordSharingFeatureService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async getReadableThread(
    args: ThreadAccessArgs,
  ): Promise<AgentChatThreadEntity> {
    const { workspaceId, userWorkspaceId, threadId } = args;
    const userWorkspace = await this.assertActiveReader(args);
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });
    if (!isDefined(thread)) {
      return this.throwNotFound();
    }
    if (thread.userWorkspaceId === userWorkspaceId) {
      return thread;
    }
    if (
      thread.id ===
      buildWorkspaceSetupChatThreadId({
        workspaceId,
        userWorkspaceId: thread.userWorkspaceId,
      })
    ) {
      return this.throwNotFound();
    }
    // SYSTEM history stays private even when generic record sharing is disabled.
    if (
      !(await this.sharingFeatureService.isRecordSharingEnabled(workspaceId))
    ) {
      return this.throwNotFound();
    }
    const { objectMetadataId, principalIds } = await this.getShareContext(
      args,
      userWorkspace,
    );
    const shares = await this.recordShareService.findByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [threadId],
    });
    if (
      !shares.some(
        (share) =>
          this.isThreadShare(share) && principalIds.includes(share.principalId),
      )
    ) {
      return this.throwNotFound();
    }
    return thread;
  }

  async getSharedThreadIds(
    args: Omit<ThreadAccessArgs, 'threadId'>,
  ): Promise<string[]> {
    if (
      !(await this.sharingFeatureService.isRecordSharingEnabled(
        args.workspaceId,
      ))
    ) {
      return [];
    }
    const userWorkspace = await this.assertActiveReader(args);
    const context = await this.getShareContext(args, userWorkspace);
    return this.recordShareService.findManualReadRecordIdsByPrincipals({
      workspaceId: args.workspaceId,
      ...context,
    });
  }

  async getSharing(args: ThreadAccessArgs) {
    const thread = await this.getReadableThread(args);
    const canManage = thread.userWorkspaceId === args.userWorkspaceId;
    const isEnabled = await this.sharingFeatureService.isRecordSharingEnabled(
      args.workspaceId,
    );
    const objectMetadataId = await this.getThreadObjectMetadataId(
      args.workspaceId,
    );
    // Readers should not learn other members' or roles' grants from the dialog.
    const shares = canManage
      ? await this.recordShareService.findByRecordIds({
          workspaceId: args.workspaceId,
          objectMetadataId,
          recordIds: [args.threadId],
        })
      : [];
    const { flatRoleMaps } = canManage
      ? await this.workspaceCacheService.getOrRecompute(args.workspaceId, [
          'flatRoleMaps',
        ])
      : { flatRoleMaps: undefined };
    const roles = isDefined(flatRoleMaps)
      ? Object.values(flatRoleMaps.byUniversalIdentifier)
          .filter(isDefined)
          .filter((role) => role.canBeAssignedToUsers)
          .map(({ id, label }) => ({ id, label }))
      : [];
    return {
      roles,
      canManage,
      isEnabled,
      shares: shares.filter((share) => this.isThreadShare(share)),
    };
  }

  async setShare(
    args: ThreadAccessArgs & {
      target: Omit<ShareWithInput, 'accessLevel'>;
      enabled: boolean;
    },
  ) {
    const thread = await this.threadRepository.findOne(args.workspaceId, {
      where: { id: args.threadId, userWorkspaceId: args.userWorkspaceId },
    });
    if (!isDefined(thread)) {
      return this.throwNotFound();
    }
    await this.assertActiveReader(args);
    if (
      args.enabled &&
      args.threadId === buildWorkspaceSetupChatThreadId(args)
    ) {
      throw new AiException(
        'Workspace setup conversations cannot be shared',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }
    if (
      args.enabled &&
      !(await this.sharingFeatureService.isRecordSharingEnabled(
        args.workspaceId,
      ))
    ) {
      throw new AiException(
        'Record sharing is not enabled for this workspace',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }
    const shareWith = {
      ...args.target,
      accessLevel: RecordShareAccessLevel.READ,
    };
    const principal = resolveShareWithPrincipalOrThrow(shareWith);
    if (args.enabled) {
      const maps = await this.workspaceCacheService.getOrRecompute(
        args.workspaceId,
        ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
      );
      validateShareWithPrincipalsOrThrow({ shareWith: [shareWith], ...maps });
    }
    const objectMetadataId = await this.getThreadObjectMetadataId(
      args.workspaceId,
    );
    await this.recordShareService.setManualShare({
      workspaceId: args.workspaceId,
      enabled: args.enabled,
      share: {
        ...principal,
        objectMetadataId,
        recordId: args.threadId,
        sourceId: args.threadId,
      },
    });
    return this.getSharing(args);
  }

  async deleteThreadWithShares({
    workspaceId,
    threadId,
    userWorkspaceId,
  }: ThreadAccessArgs): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const objectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    // The history route holds one transaction across both schemas, including
    // legacy core threads. A grant-cleanup failure must roll back the deletion.
    return this.threadRepository.query(
      workspaceId,
      async ({ manager, table, storage }) => {
        const deleted = await manager.query<{ id: string }[]>(
          `WITH deleted_thread AS (
          DELETE FROM ${table('agentChatThread')}
          WHERE id = $1 AND "userWorkspaceId" = $2 ${storage === 'core' ? 'AND "workspaceId" = $3' : ''}
          RETURNING id
        ) SELECT id FROM deleted_thread`,
          storage === 'core'
            ? [threadId, userWorkspaceId, workspaceId]
            : [threadId, userWorkspaceId],
        );
        if (deleted.length === 0) {
          return false;
        }
        if (isDefined(objectMetadata)) {
          await this.recordShareService.deleteByRecordIdsInTransaction({
            workspaceId,
            objectMetadataId: objectMetadata.id,
            recordIds: [threadId],
            manager,
          });
        }
        return true;
      },
    );
  }

  private isThreadShare(share: RecordShare): boolean {
    // Only grants managed by the conversation owner may expose its contents.
    return (
      share.rowCause === RecordShareRowCause.MANUAL &&
      share.sourceId === share.recordId &&
      share.accessLevel === RecordShareAccessLevel.READ
    );
  }

  private async assertActiveReader({
    workspaceId,
    userWorkspaceId,
  }: Omit<ThreadAccessArgs, 'threadId'>) {
    if (!isNonEmptyString(userWorkspaceId) || !isNonEmptyString(workspaceId)) {
      this.throwNotFound();
    }
    const member = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
    });
    if (
      !isDefined(member) ||
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId,
        userWorkspaceId,
        setting: PermissionFlagType.AI,
      }))
    ) {
      this.throwNotFound();
    }
    return member;
  }

  private async getThreadObjectMetadataId(workspaceId: string) {
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
    return objectMetadata.id;
  }

  private async getShareContext(
    { workspaceId, userWorkspaceId }: Omit<ThreadAccessArgs, 'threadId'>,
    userWorkspace: UserWorkspaceEntity,
  ) {
    const {
      flatObjectMetadataMaps,
      flatWorkspaceMemberMaps,
      userWorkspaceRoleMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatWorkspaceMemberMaps',
      'userWorkspaceRoleMap',
    ]);
    const objectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    if (!isDefined(objectMetadata)) {
      return this.throwNotFound();
    }
    const memberId = flatWorkspaceMemberMaps.idByUserId[userWorkspace.userId];
    const member = isDefined(memberId)
      ? flatWorkspaceMemberMaps.byId[memberId]
      : undefined;
    const roleId = userWorkspaceRoleMap[userWorkspaceId];
    return {
      objectMetadataId: objectMetadata.id,
      principalIds: [
        EVERYONE_PRINCIPAL_ID,
        isDefined(member) && !isDefined(member.deletedAt)
          ? member.id
          : undefined,
        roleId,
      ].filter(isDefined),
    };
  }

  private throwNotFound(): never {
    throw new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND);
  }
}
