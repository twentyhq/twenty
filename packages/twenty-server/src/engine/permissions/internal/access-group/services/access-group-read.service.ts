/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildPrincipalsRelatedRecordPathAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-principals-related-record-path-access-groups-or-throw.util';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { canRelatedRecordPathExtendAccess } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-extend-access.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { AccessGroupReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group-read.repository';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupReadRepository: AccessGroupReadRepository,
  ) {}

  async findPrincipalsCompactIds({
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
    const { featureFlagsMap, rolesPermissions, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'featureFlagsMap',
        'rolesPermissions',
        'flatFieldMetadataMaps',
      ]);

    return this.findCompactIds({
      workspaceId,
      accessGroups: buildRoleAccessGroupsOrThrow({
        roleId: mainPrincipal.roleId,
        objectMetadataId,
        objectRecordsPermissions:
          rolesPermissions[mainPrincipal.roleId]?.objects[objectMetadataId],
        operationTypes: [operationType],
        workspaceMembers: await this.findPrincipalsWorkspaceMembers(principals),
        flatFieldMetadataMaps,
        isRelationHopEnabled: isRlsRelationHopEnabled(featureFlagsMap),
      }),
    });
  }

  async findPrincipalsRelatedRecordPathCompactIds(
    request: PermissionsObjectAccessRequest,
  ): Promise<number[]> {
    if (!canRelatedRecordPathExtendAccess(request)) {
      return [];
    }

    const { workspaceId } = request.principals;
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return this.findCompactIds({
      workspaceId,
      accessGroups: buildPrincipalsRelatedRecordPathAccessGroupsOrThrow({
        request,
        workspaceMembers: await this.findPrincipalsWorkspaceMembers(
          request.principals,
        ),
        flatFieldMetadataMaps,
      }),
    });
  }

  private async findPrincipalsWorkspaceMembers({
    workspaceId,
    mainPrincipal,
  }: Pick<
    PermissionsPrincipalsWithRolesContext,
    'workspaceId' | 'mainPrincipal'
  >): Promise<RlsWorkspaceMember[]> {
    if (!isPermissionMainPrincipalWorkspaceMember(mainPrincipal)) {
      return [];
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);
    const workspaceMember =
      flatWorkspaceMemberMaps.byId[mainPrincipal.workspaceMemberId];

    return isDefined(workspaceMember) ? [workspaceMember] : [];
  }

  private async findCompactIds({
    workspaceId,
    accessGroups,
  }: {
    workspaceId: string;
    accessGroups: AccessGroupWithoutCompactId[];
  }): Promise<number[]> {
    if (!isNonEmptyArray(accessGroups)) {
      return [];
    }

    return this.accessGroupReadRepository.findCompactIdsByGroupHashes({
      workspaceId,
      groupHashes: accessGroups.map(({ groupHash }) => groupHash),
    });
  }
}
