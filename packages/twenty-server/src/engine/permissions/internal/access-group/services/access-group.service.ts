/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
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

    await this.accessGroupRepository.insertAccessGroups({
      workspaceId,
      newAccessGroups: newAccessGroups.filter(
        ({ groupHash }) => !existingGroupHashes.has(groupHash),
      ),
    });

    if (hasFailures || newAccessGroups.length === 0) {
      return;
    }

    const newGroupHashes = new Set(
      newAccessGroups.map(({ groupHash }) => groupHash),
    );
    const staleGroupHashes = [...existingGroupHashes].filter(
      (groupHash) => !newGroupHashes.has(groupHash),
    );

    if (isNonEmptyArray(staleGroupHashes)) {
      await this.accessGroupRepository.deleteAccessGroups({
        workspaceId,
        groupHashes: staleGroupHashes,
      });
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
