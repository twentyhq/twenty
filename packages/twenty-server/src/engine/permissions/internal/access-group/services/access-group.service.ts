/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { AccessGroupOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/access-group-orm.service';
import { buildRoleAccessGroupDefinitionsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-group-definitions-or-throw.util';
import { buildWorkspaceAccessGroupDefinitions } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-group-definitions.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Syncs of a workspace can queue behind each other, so wait longer than the default 5 seconds
const SYNC_LOCK_OPTIONS = { ms: 500, maxRetries: 120 };

@Injectable()
export class AccessGroupService {
  private readonly logger = new Logger(AccessGroupService.name);

  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupOrmService: AccessGroupOrmService,
  ) {}

  async syncAccessGroups(workspaceId: string): Promise<void> {
    // Serialized so an older sync cannot delete the groups of a newer one
    await this.cacheLockService.withLock(
      () => this.syncAccessGroupsWithLock(workspaceId),
      `access-group-sync:${workspaceId}`,
      SYNC_LOCK_OPTIONS,
    );
  }

  private async syncAccessGroupsWithLock(workspaceId: string): Promise<void> {
    // This process memoizes reads for seconds, and syncing from stale grants would delete live groups
    await this.workspaceCacheService.clearMemoizedReads(workspaceId);

    const { definitions, failures } = buildWorkspaceAccessGroupDefinitions(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'userWorkspaceRoleMap',
        'flatWorkspaceMemberMaps',
      ]),
    );

    for (const { roleId, objectMetadataId, message } of failures) {
      this.logger.error(
        `Could not compute access groups of role ${roleId} on object ${objectMetadataId} in workspace ${workspaceId}: ${message}`,
      );
    }

    const existingGroupHashes = new Set(
      await this.accessGroupOrmService.findGroupHashes(workspaceId),
    );

    await this.accessGroupOrmService.insertAccessGroups({
      workspaceId,
      definitions: definitions.filter(
        ({ groupHash }) => !existingGroupHashes.has(groupHash),
      ),
    });

    if (definitions.length === 0 && existingGroupHashes.size > 0) {
      this.logger.error(
        `Kept ${existingGroupHashes.size} access groups in workspace ${workspaceId}: the sync computed none`,
      );
    }

    // Group ids are never reused, so an incomplete or empty read must not delete anything
    if (failures.length > 0 || definitions.length === 0) {
      return;
    }

    const expectedGroupHashes = new Set(
      definitions.map(({ groupHash }) => groupHash),
    );
    const staleGroupHashes = [...existingGroupHashes].filter(
      (groupHash) => !expectedGroupHashes.has(groupHash),
    );

    if (isNonEmptyArray(staleGroupHashes)) {
      await this.accessGroupOrmService.deleteAccessGroups({
        workspaceId,
        groupHashes: staleGroupHashes,
      });
    }
  }

  // Limiting roles have no RLS, so only the main role adds groups. A group with no row reaches no record.
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
    const definitions = buildRoleAccessGroupDefinitionsOrThrow({
      roleId: mainPrincipal.roleId,
      objectMetadataId,
      objectRecordsPermissions:
        rolesPermissions[mainPrincipal.roleId]?.objects[objectMetadataId],
      operationTypes: [operationType],
      workspaceMembers: isDefined(workspaceMember) ? [workspaceMember] : [],
      flatFieldMetadataMaps,
    });

    if (!isNonEmptyArray(definitions)) {
      return [];
    }

    return this.accessGroupOrmService.findCompactIdsByGroupHashes({
      workspaceId,
      groupHashes: definitions.map(({ groupHash }) => groupHash),
    });
  }
}
