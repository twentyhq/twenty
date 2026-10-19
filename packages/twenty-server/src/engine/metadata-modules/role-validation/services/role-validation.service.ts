import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { validateFlatRoleTargetRoleIsEntitled } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-role-target-role-is-entitled.util';

@Injectable()
export class RoleValidationService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async validateRoleAssignableToUsersOrThrow(
    roleId: string,
    workspaceId: string,
  ): Promise<void> {
    const { flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );
    const role = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: roleId,
      flatEntityMaps: flatRoleMaps,
    });

    if (!role) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    if (!role.canBeAssignedToUsers) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
        PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
      );
    }

    const { billingEntitlements } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'billingEntitlements',
      ]);

    const [entitlementError] = validateFlatRoleTargetRoleIsEntitled({
      flatRole: role,
      flatRoleTarget: { agentUniversalIdentifier: null },
      billingEntitlements,
      buildOptions: { isSystemBuild: false },
    });

    if (isDefined(entitlementError)) {
      throw new PermissionsException(
        entitlementError.message,
        PermissionsExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
        { userFriendlyMessage: entitlementError.userFriendlyMessage },
      );
    }
  }
}
