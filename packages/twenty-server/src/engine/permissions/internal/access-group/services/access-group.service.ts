/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECOMPUTE_ACCESS_GROUP_IDS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/recompute-access-group-ids-job-name.constant';
import { type RecomputeAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-access-group-ids-job-data.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { AccessGroupRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group.repository';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { buildWorkspaceAccessGroups } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-groups.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SYNC_LOCK_OPTIONS = { ms: 500, maxRetries: 120 };

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
      `access-group-sync:${workspaceId}`,
      SYNC_LOCK_OPTIONS,
    );
  }

  private async syncAccessGroupsWithLock(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    const { accessGroups: newAccessGroups, hasFailures } =
      buildWorkspaceAccessGroups(
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'rolesPermissions',
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
          'userWorkspaceRoleMap',
          'flatWorkspaceMemberMaps',
        ]),
      );

    const existingGroupHashes = new Set(
      await this.accessGroupRepository.findGroupHashes(workspaceId),
    );

    const insertedAccessGroups = newAccessGroups.filter(
      ({ groupHash }) => !existingGroupHashes.has(groupHash),
    );

    await this.accessGroupRepository.insertAccessGroups({
      workspaceId,
      newAccessGroups: insertedAccessGroups,
    });

    const objectMetadataIdsToRecompute = new Set(
      insertedAccessGroups.map(({ objectMetadataId }) => objectMetadataId),
    );

    if (hasFailures || newAccessGroups.length === 0) {
      await this.scheduleAccessGroupIdsRecompute({
        workspaceId,
        objectMetadataIdsToRecompute,
        deletedAccessGroups: [],
      });

      return;
    }

    const newGroupHashes = new Set(
      newAccessGroups.map(({ groupHash }) => groupHash),
    );
    const staleGroupHashes = [...existingGroupHashes].filter(
      (groupHash) => !newGroupHashes.has(groupHash),
    );

    const deletedAccessGroups = isNonEmptyArray(staleGroupHashes)
      ? await this.accessGroupRepository.deleteAccessGroups({
          workspaceId,
          groupHashes: staleGroupHashes,
        })
      : [];

    await this.scheduleAccessGroupIdsRecompute({
      workspaceId,
      objectMetadataIdsToRecompute,
      deletedAccessGroups,
    });
  }

  // An object with a new group recomputes every record, which also drops its deleted groups
  private async scheduleAccessGroupIdsRecompute({
    workspaceId,
    objectMetadataIdsToRecompute,
    deletedAccessGroups,
  }: {
    workspaceId: string;
    objectMetadataIdsToRecompute: Set<string>;
    deletedAccessGroups: Pick<AccessGroup, 'compactId' | 'objectMetadataId'>[];
  }): Promise<void> {
    const deletedCompactIdsByObjectMetadataId = new Map<string, number[]>();

    for (const { compactId, objectMetadataId } of deletedAccessGroups) {
      if (objectMetadataIdsToRecompute.has(objectMetadataId)) {
        continue;
      }

      deletedCompactIdsByObjectMetadataId.set(objectMetadataId, [
        ...(deletedCompactIdsByObjectMetadataId.get(objectMetadataId) ?? []),
        compactId,
      ]);
    }

    const jobsData: RecomputeAccessGroupIdsJobData[] = [
      ...[...objectMetadataIdsToRecompute].map((objectMetadataId) => ({
        workspaceId,
        objectMetadataId,
        heldCompactIds: null,
      })),
      ...[...deletedCompactIdsByObjectMetadataId].map(
        ([objectMetadataId, heldCompactIds]) => ({
          workspaceId,
          objectMetadataId,
          heldCompactIds,
        }),
      ),
    ];

    for (const jobData of jobsData) {
      await this.messageQueueService.add<RecomputeAccessGroupIdsJobData>(
        RECOMPUTE_ACCESS_GROUP_IDS_JOB_NAME,
        jobData,
        { isWorkspaceJob: true, workspaceId, retryLimit: 3 },
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
    const { rolesPermissions, flatFieldMetadataMaps, flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
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
