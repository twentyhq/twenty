/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  ACCESS_GROUP_SYNC_LOCK_OPTIONS,
  buildAccessGroupSyncLockKey,
} from 'src/engine/permissions/internal/access-group/constants/access-group-sync-lock.constant';
import { RECOMPUTE_RECORD_ACCESS_GROUP_IDS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-record-access-group-ids-job-name.constant';
import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { buildWorkspaceAccessGroups } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-groups.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { isRowLevelPermissionRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-row-level-permission-relation-hop-enabled.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupRepository: AccessGroupRepository,
    @InjectMessageQueue(MessageQueue.accessGroupQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async syncAccessGroups(workspaceId: string): Promise<void> {
    await this.cacheLockService.withLock(
      () => this.syncAccessGroupsWithLock(workspaceId),
      buildAccessGroupSyncLockKey(workspaceId),
      ACCESS_GROUP_SYNC_LOCK_OPTIONS,
    );
  }

  private async syncAccessGroupsWithLock(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    const workspaceCache = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'featureFlagsMap',
        'rolesPermissions',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'userWorkspaceRoleMap',
        'flatWorkspaceMemberMaps',
      ],
    );
    const { accessGroups: newAccessGroups, hasFailures } =
      buildWorkspaceAccessGroups(workspaceCache);

    const existingAccessGroups =
      await this.accessGroupRepository.findAccessGroups(workspaceId);
    const existingGroupHashes = new Set(
      existingAccessGroups.map(({ groupHash }) => groupHash),
    );
    const newGroupHashes = new Set(
      newAccessGroups.map(({ groupHash }) => groupHash),
    );
    const insertedAccessGroups = newAccessGroups.filter(
      ({ groupHash }) => !existingGroupHashes.has(groupHash),
    );
    const canDeleteStaleAccessGroups =
      !hasFailures && newAccessGroups.length > 0;
    const staleAccessGroups = existingAccessGroups.filter(
      ({ groupHash }) =>
        canDeleteStaleAccessGroups && !newGroupHashes.has(groupHash),
    );

    await this.scheduleRecordAccessGroupIdsRecompute({
      workspaceId,
      objectMetadataIds: new Set(
        [...insertedAccessGroups, ...staleAccessGroups]
          .map(({ objectMetadataId }) => objectMetadataId)
          .filter((objectMetadataId) =>
            isObjectUsingRecordAccessGroups({
              rolesPermissions: workspaceCache.rolesPermissions,
              flatObjectMetadataMaps: workspaceCache.flatObjectMetadataMaps,
              objectMetadataId,
            }),
          ),
      ),
    });

    await this.accessGroupRepository.insertAccessGroups({
      workspaceId,
      newAccessGroups: insertedAccessGroups,
    });

    if (isNonEmptyArray(staleAccessGroups)) {
      await this.accessGroupRepository.deleteAccessGroups({
        workspaceId,
        groupHashes: staleAccessGroups.map(({ groupHash }) => groupHash),
      });
    }
  }

  private async scheduleRecordAccessGroupIdsRecompute({
    workspaceId,
    objectMetadataIds,
  }: {
    workspaceId: string;
    objectMetadataIds: Set<string>;
  }): Promise<void> {
    for (const objectMetadataId of objectMetadataIds) {
      await this.messageQueueService.add<RecomputeRecordAccessGroupIdsJobData>(
        RECOMPUTE_RECORD_ACCESS_GROUP_IDS_JOB_NAME,
        { workspaceId, objectMetadataId },
        {
          isWorkspaceJob: true,
          workspaceId,
          retryLimit: 3,
          // One recompute per object at a time, and at most one waiting behind it
          deduplication: {
            id: `record-access-group-ids:${workspaceId}:${objectMetadataId}`,
            keepLastIfActive: true,
          },
        },
      );
    }
  }

  async findCallerCompactIds({
    principals,
    objectMetadataId,
    operationType,
  }: {
    principals: Pick<
      PermissionsPrincipalsWithRolesContext,
      'workspaceId' | 'mainPrincipal'
    >;
    objectMetadataId: string;
    operationType: ObjectRecordsOperationType;
  }): Promise<number[]> {
    const { workspaceId, mainPrincipal } = principals;
    const {
      featureFlagsMap,
      rolesPermissions,
      flatFieldMetadataMaps,
      flatWorkspaceMemberMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'featureFlagsMap',
      'rolesPermissions',
      'flatFieldMetadataMaps',
      'flatWorkspaceMemberMaps',
    ]);
    const workspaceMember = isPermissionMainPrincipalWorkspaceMember(
      mainPrincipal,
    )
      ? flatWorkspaceMemberMaps.byId[mainPrincipal.workspaceMemberId]
      : undefined;
    const callerAccessGroups = buildRoleAccessGroupsOrThrow({
      roleId: mainPrincipal.roleId,
      objectMetadataId,
      objectRecordsPermissions:
        rolesPermissions[mainPrincipal.roleId]?.objects[objectMetadataId],
      operationTypes: [operationType],
      workspaceMembers: isDefined(workspaceMember) ? [workspaceMember] : [],
      flatFieldMetadataMaps,
      isRelationHopEnabled:
        isRowLevelPermissionRelationHopEnabled(featureFlagsMap),
    });

    if (!isNonEmptyArray(callerAccessGroups)) {
      return [];
    }

    return this.accessGroupRepository.findCompactIdsByGroupHashes({
      workspaceId,
      groupHashes: callerAccessGroups.map(({ groupHash }) => groupHash),
    });
  }
}
