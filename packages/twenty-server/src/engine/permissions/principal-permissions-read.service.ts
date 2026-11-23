/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { isApiKeyExemptFromChannelVisibility } from 'src/engine/permissions/channel-visibility/utils/is-api-key-exempt-from-channel-visibility.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { getWorkspaceMemberIndividualRoleUniversalIdentifier } from 'src/engine/permissions/workspace-member-individual-role/utils/get-workspace-member-individual-role-universal-identifier.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { canAuthContextHoldRoles } from 'src/engine/permissions/internal/principal/utils/can-auth-context-hold-roles.util';
import { findUserWorkspaceRoleIdsOrThrow } from 'src/engine/permissions/internal/principal/utils/find-user-workspace-role-ids-or-throw.util';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/internal/principal/utils/resolve-permissions-principals-with-roles.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationGrantRoleLookupService } from 'src/engine/core-modules/application/application-grant-role-lookup/services/application-grant-role-lookup.service';

@Injectable()
export class PrincipalPermissionsReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationGrantRoleLookupService: ApplicationGrantRoleLookupService,
  ) {}

  async resolvePermissionsPrincipalsOrThrow({
    authContext,
  }: {
    authContext: PermissionsAuthContext;
  }): Promise<PermissionsPrincipalsWithRolesContext> {
    const principals = await this.resolvePermissionsPrincipals({ authContext });

    if (!isDefined(principals)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return principals;
  }

  async resolveUserWorkspacePermissionsPrincipalsOrThrow({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<PermissionsPrincipalsWithRolesContext> {
    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);

    return buildRolePermissionsPrincipals({
      workspaceId,
      roleIds: findUserWorkspaceRoleIdsOrThrow({
        userWorkspaceId,
        userWorkspaceRoleMap,
      }),
    });
  }

  async resolvePermissionsPrincipals({
    authContext,
  }: {
    authContext: PermissionsAuthContext;
  }): Promise<PermissionsPrincipalsWithRolesContext | undefined> {
    if (!canAuthContextHoldRoles(authContext)) {
      return undefined;
    }

    const workspaceId = authContext.workspace.id;
    const {
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
      flatRoleTargetByApplicationIdMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'flatRoleTargetByAgentIdMaps',
      'flatRoleTargetByApplicationIdMaps',
      'flatApplicationMaps',
    ]);

    return resolvePermissionsPrincipalsWithRoles({
      authContext,
      roleMaps: {
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        flatRoleTargetByAgentIdMaps,
        flatRoleTargetByApplicationIdMaps,
        workspaceCustomApplicationId:
          await this.applicationGrantRoleLookupService.findWorkspaceCustomApplicationIdOrThrow(
            workspaceId,
          ),
        flatApplicationMaps,
        flatWorkspaceMemberMaps:
          await this.findFlatWorkspaceMemberMaps(authContext),
        flatRoleTargetMaps: await this.findFlatRoleTargetMaps(authContext),
        // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
        apiKeysIndividualRoleId:
          await this.findApiKeysIndividualRoleId(authContext),
      },
    });
  }

  private async findFlatWorkspaceMemberMaps(
    authContext: PermissionsAuthContext,
  ) {
    if (authContext.type !== 'user') {
      return undefined;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatWorkspaceMemberMaps'],
      );

    return flatWorkspaceMemberMaps;
  }

  private async findApiKeysIndividualRoleId(
    authContext: PermissionsAuthContext,
  ): Promise<string | undefined> {
    if (authContext.type !== 'apiKey') {
      return undefined;
    }

    const { featureFlagsMap, flatRoleMaps, apiKeyRoleMap } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['featureFlagsMap', 'flatRoleMaps', 'apiKeyRoleMap'],
      );

    if (!isApiKeyExemptFromChannelVisibility(featureFlagsMap)) {
      return undefined;
    }

    const apiKeyRoleId = apiKeyRoleMap[authContext.apiKey.id];
    const apiKeyFlatRole = isDefined(apiKeyRoleId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: apiKeyRoleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

    if (
      !apiKeyFlatRole?.canBeAssignedToUsers ||
      !apiKeyFlatRole.canReadAllObjectRecords
    ) {
      return undefined;
    }

    return flatRoleMaps.byUniversalIdentifier[
      getWorkspaceMemberIndividualRoleUniversalIdentifier({
        holder: { type: 'apiKeys' },
      })
    ]?.id;
  }

  private async findFlatRoleTargetMaps(authContext: PermissionsAuthContext) {
    if (authContext.type !== 'webhook') {
      return undefined;
    }

    const { flatRoleTargetMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatRoleTargetMaps'],
      );

    return flatRoleTargetMaps;
  }
}
