/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildCallerRelatedRecordPathAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-caller-related-record-path-access-groups-or-throw.util';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canRelatedRecordPathGrantOperation } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-grant-operation.util';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { AccessGroupReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group-read.repository';
import { isRowLevelPermissionRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-row-level-permission-relation-hop-enabled.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupReadRepository: AccessGroupReadRepository,
  ) {}

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
        workspaceMembers: await this.findCallerWorkspaceMembers(principals),
        flatFieldMetadataMaps,
        isRelationHopEnabled:
          isRowLevelPermissionRelationHopEnabled(featureFlagsMap),
      }),
    });
  }

  async findCallerRelatedRecordPathCompactIds(
    request: PermissionsObjectAccessRequest,
  ): Promise<number[]> {
    if (!canRelatedRecordPathGrantOperation(request)) {
      return [];
    }

    const { workspaceId } = request.principals;
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return this.findCompactIds({
      workspaceId,
      accessGroups: buildCallerRelatedRecordPathAccessGroupsOrThrow({
        request,
        workspaceMembers: await this.findCallerWorkspaceMembers(
          request.principals,
        ),
        flatFieldMetadataMaps,
      }),
    });
  }

  private async findCallerWorkspaceMembers({
    workspaceId,
    mainPrincipal,
  }: Pick<
    PermissionsPrincipalsWithRolesContext,
    'workspaceId' | 'mainPrincipal'
  >): Promise<RowLevelPermissionWorkspaceMember[]> {
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
