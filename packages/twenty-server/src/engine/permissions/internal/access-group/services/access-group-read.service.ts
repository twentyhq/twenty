/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordsOperationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
import { buildPrincipalsRelatedRecordPathAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-principals-related-record-path-access-groups-or-throw.util';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { canRelatedRecordPathExtendAccess } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-extend-access.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { AccessGroupReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group-read.repository';
import { attachRlsRelationValues } from 'src/engine/permissions/internal/rls/utils/attach-rls-relation-values.util';
import { findWorkspaceMemberRelationPredicates } from 'src/engine/permissions/internal/rls/utils/find-workspace-member-relation-predicates.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AccessGroupReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupReadRepository: AccessGroupReadRepository,
  ) {}

  async findPrincipalsAccessGroupCompactIds({
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
    const { workspaceId } = principals;
    const { rolesPermissions, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
        'flatFieldMetadataMaps',
      ]);

    const workspaceMember = await this.findPrincipalWorkspaceMember(principals);
    const workspaceMembers = [workspaceMember].filter(isDefined);

    return this.findCompactIds({
      workspaceId,
      accessGroups: principals.mainPrincipal.roleIds.flatMap((roleId) =>
        buildRoleAccessGroupsOrThrow({
          objectMetadataId,
          objectRecordsPermissions:
            rolesPermissions[roleId]?.objects[objectMetadataId],
          operationTypes: [operationType],
          workspaceMembers,
          flatFieldMetadataMaps,
        }),
      ),
    });
  }

  async findPrincipalsRelatedRecordPathAccessGroupCompactIds(
    request: PermissionsObjectAccessRequest,
  ): Promise<number[]> {
    return this.findCompactIds({
      workspaceId: request.principals.workspaceId,
      accessGroups:
        await this.buildPrincipalsRelatedRecordPathAccessGroups(request),
    });
  }

  async findPrincipalsRelatedRecordPathAccessGroupCompactIdsShowingFields({
    request,
    sourceFields,
  }: {
    request: PermissionsObjectAccessRequest;
    sourceFields: {
      sourceObjectMetadataId: string | null;
      sourceFieldMetadataId: string;
    }[];
  }): Promise<number[][]> {
    const accessGroups =
      await this.buildPrincipalsRelatedRecordPathAccessGroups(request);

    return Promise.all(
      sourceFields.map(({ sourceObjectMetadataId, sourceFieldMetadataId }) =>
        this.findCompactIds({
          workspaceId: request.principals.workspaceId,
          accessGroups: accessGroups.filter(
            ({ objectMetadataId, unreadableFieldIds }) =>
              isDefined(sourceObjectMetadataId) &&
              (objectMetadataId !== sourceObjectMetadataId ||
                !unreadableFieldIds.includes(sourceFieldMetadataId)),
          ),
        }),
      ),
    );
  }

  private async buildPrincipalsRelatedRecordPathAccessGroups(
    request: PermissionsObjectAccessRequest,
  ): Promise<AccessGroupWithoutCompactId[]> {
    if (!canRelatedRecordPathExtendAccess(request)) {
      return [];
    }

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        request.principals.workspaceId,
        ['flatFieldMetadataMaps'],
      );

    return buildPrincipalsRelatedRecordPathAccessGroupsOrThrow({
      request,
      workspaceMembers: [
        await this.findPrincipalWorkspaceMember(request.principals),
      ].filter(isDefined),
      flatFieldMetadataMaps,
    });
  }

  private async findPrincipalWorkspaceMember({
    workspaceId,
    mainPrincipal,
  }: Pick<
    PermissionsPrincipalsWithRolesContext,
    'workspaceId' | 'mainPrincipal'
  >): Promise<RlsWorkspaceMember | undefined> {
    if (!isPermissionMainPrincipalWorkspaceMember(mainPrincipal)) {
      return undefined;
    }

    const { flatWorkspaceMemberMaps, rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
        'rolesPermissions',
      ]);
    const workspaceMember =
      flatWorkspaceMemberMaps.byId[mainPrincipal.workspaceMemberId];

    if (
      !isDefined(workspaceMember) ||
      !isNonEmptyArray(findWorkspaceMemberRelationPredicates(rolesPermissions))
    ) {
      return workspaceMember;
    }

    const { rlsWorkspaceMemberRelationValueMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rlsWorkspaceMemberRelationValueMaps',
      ]);

    return attachRlsRelationValues({
      workspaceMember,
      rlsWorkspaceMemberRelationValueMaps,
    });
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
