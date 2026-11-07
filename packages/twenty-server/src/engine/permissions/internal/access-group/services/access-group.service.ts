/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AccessGroupOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/access-group-orm.service';
import { buildRoleAccessGroupDefinitionsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-group-definitions-or-throw.util';
import { buildWorkspaceAccessGroupDefinitionsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-group-definitions-or-throw.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupOrmService: AccessGroupOrmService,
  ) {}

  // Serialized so an older sync cannot delete the groups of a newer one
  async syncAccessGroups(workspaceId: string): Promise<void> {
    await this.accessGroupOrmService.runWithSyncLock({
      workspaceId,
      run: (transactionScope) =>
        this.syncAccessGroupsInTransaction({ workspaceId, transactionScope }),
    });
  }

  private async syncAccessGroupsInTransaction({
    workspaceId,
    transactionScope,
  }: {
    workspaceId: string;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    // This process memoizes reads for seconds, and syncing from stale grants would delete live groups
    await this.workspaceCacheService.evictWorkspaceFromLocalCache(workspaceId);

    const {
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      flatWorkspaceMemberMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'rolesPermissions',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'userWorkspaceRoleMap',
      'flatWorkspaceMemberMaps',
    ]);

    const definitions = buildWorkspaceAccessGroupDefinitionsOrThrow({
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      flatWorkspaceMemberMaps,
    });
    const existingGroupHashes = new Set(
      await this.accessGroupOrmService.findGroupHashes({
        workspaceId,
        transactionScope,
      }),
    );
    const expectedGroupHashes = new Set(
      definitions.map(({ groupHash }) => groupHash),
    );
    const staleGroupHashes = [...existingGroupHashes].filter(
      (groupHash) => !expectedGroupHashes.has(groupHash),
    );

    await this.accessGroupOrmService.insertAccessGroups({
      workspaceId,
      definitions: definitions.filter(
        ({ groupHash }) => !existingGroupHashes.has(groupHash),
      ),
      transactionScope,
    });

    if (isNonEmptyArray(staleGroupHashes)) {
      await this.accessGroupOrmService.deleteAccessGroups({
        workspaceId,
        groupHashes: staleGroupHashes,
        transactionScope,
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
      workspaceMembers: workspaceMember ? [workspaceMember] : [],
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
