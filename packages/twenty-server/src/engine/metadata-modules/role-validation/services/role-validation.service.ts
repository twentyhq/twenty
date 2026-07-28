import { Injectable } from '@nestjs/common';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

@Injectable()
export class RoleValidationService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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
  }
}
