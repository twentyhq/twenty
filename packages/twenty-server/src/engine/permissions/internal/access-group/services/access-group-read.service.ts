/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  FeatureFlagKey,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildPrincipalsRelatedRecordPathAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-principals-related-record-path-access-groups-or-throw.util';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { canRelatedRecordPathExtendAccess } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-extend-access.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';
import { getPermissionsPrincipalsMainRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-main-role-ids.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { AccessGroupReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/access-group-read.repository';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type PrincipalsAccessGroupsQuestion = {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    'workspaceId' | 'mainPrincipal'
  >;
  objectMetadataId: string;
  operationType: ObjectRecordsOperationType;
};

@Injectable()
export class AccessGroupReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly accessGroupReadRepository: AccessGroupReadRepository,
  ) {}

  async findPrincipalsCompactIds(
    question: PrincipalsAccessGroupsQuestion,
  ): Promise<number[]> {
    return this.findCompactIds({
      workspaceId: question.principals.workspaceId,
      accessGroups: await this.buildPrincipalsAccessGroups(question),
    });
  }

  private async buildPrincipalsAccessGroups({
    principals,
    objectMetadataId,
    operationType,
  }: PrincipalsAccessGroupsQuestion): Promise<AccessGroupWithoutCompactId[]> {
    const { featureFlagsMap, rolesPermissions, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(principals.workspaceId, [
        'featureFlagsMap',
        'rolesPermissions',
        'flatFieldMetadataMaps',
      ]);
    const workspaceMembers =
      await this.findPrincipalsWorkspaceMembers(principals);

    return getPermissionsPrincipalsMainRoleIds(principals).flatMap((roleId) =>
      buildRoleAccessGroupsOrThrow({
        roleId,
        objectMetadataId,
        objectRecordsPermissions:
          rolesPermissions[roleId]?.objects[objectMetadataId],
        operationTypes: [operationType],
        workspaceMembers,
        flatFieldMetadataMaps,
        isRelationHopEnabled: isRlsRelationHopEnabled(featureFlagsMap),
        isSharingGroupsByPredicateValue:
          featureFlagsMap[FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED] ??
          false,
      }),
    );
  }

  // a record holds one of a rule's groups exactly when the rule reaches it
  async findPrincipalsCompactIdsByRlsRuleId(
    question: PrincipalsAccessGroupsQuestion,
  ): Promise<Map<string, number[]>> {
    const { workspaceId } = question.principals;
    const rlsRuleAccessGroups = (
      await this.buildPrincipalsAccessGroups(question)
    ).filter(({ rowLevelPermissionPredicateGroupId }) =>
      isDefined(rowLevelPermissionPredicateGroupId),
    );
    const compactIdsByRlsRuleId = new Map<string, number[]>();

    if (!isNonEmptyArray(rlsRuleAccessGroups)) {
      return compactIdsByRlsRuleId;
    }

    const compactIdByGroupHash =
      await this.accessGroupReadRepository.findCompactIdByGroupHash({
        workspaceId,
        groupHashes: rlsRuleAccessGroups.map(({ groupHash }) => groupHash),
      });

    for (const {
      rowLevelPermissionPredicateGroupId,
      groupHash,
    } of rlsRuleAccessGroups) {
      if (!isDefined(rowLevelPermissionPredicateGroupId)) {
        continue;
      }

      const compactId = compactIdByGroupHash.get(groupHash);

      compactIdsByRlsRuleId.set(rowLevelPermissionPredicateGroupId, [
        ...(compactIdsByRlsRuleId.get(rowLevelPermissionPredicateGroupId) ??
          []),
        ...(isDefined(compactId) ? [compactId] : []),
      ]);
    }

    return compactIdsByRlsRuleId;
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
