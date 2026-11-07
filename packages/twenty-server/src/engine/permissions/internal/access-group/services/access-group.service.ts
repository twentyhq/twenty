/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { AccessGroupOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/access-group-orm.service';
import { buildRoleAccessGroupDefinitions } from 'src/engine/permissions/internal/access-group/utils/build-role-access-group-definitions.util';
import { buildWorkspaceAccessGroupDefinitions } from 'src/engine/permissions/internal/access-group/utils/build-workspace-access-group-definitions.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupOrmService: AccessGroupOrmService,
  ) {}

  async syncAccessGroups(workspaceId: string): Promise<void> {
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

    const definitions = buildWorkspaceAccessGroupDefinitions({
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      userWorkspaceRoleMap,
      flatWorkspaceMemberMaps,
    });
    const existingGroupHashes = new Set(
      await this.accessGroupOrmService.findGroupHashes(workspaceId),
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
    });

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
    principals: PermissionsPrincipalsWithRolesContext;
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
    const definitions = buildRoleAccessGroupDefinitions({
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
