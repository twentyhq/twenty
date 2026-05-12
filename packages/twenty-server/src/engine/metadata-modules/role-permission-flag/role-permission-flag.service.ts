import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { fromCreateRolePermissionFlagInputToFlatRolePermissionFlagToCreate } from 'src/engine/metadata-modules/flat-role-permission-flag/utils/from-create-role-permission-flag-input-to-flat-role-permission-flag-to-create.util';
import { type UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/role-permission-flag/dtos/upsert-permission-flags.input';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RolePermissionFlagService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async upsertPermissionFlags({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertPermissionFlagsInput;
  }): Promise<FlatRolePermissionFlag[]> {
    const { flatRolePermissionFlagMaps, flatRoleMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRolePermissionFlagMaps', 'flatRoleMaps'],
        },
      );

    const roleUniversalId = flatRoleMaps.universalIdentifierById[input.roleId];
    const role = isDefined(roleUniversalId)
      ? flatRoleMaps.byUniversalIdentifier[roleUniversalId]
      : undefined;

    if (!isDefined(role)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
        {
          userFriendlyMessage: msg`The role you are trying to modify could not be found.`,
        },
      );
    }

    const invalidFlags = input.permissionFlagKeys.filter(
      (flag) => !Object.values(PermissionFlagType).includes(flag),
    );

    if (invalidFlags.length > 0) {
      throw new PermissionsException(
        `${PermissionsExceptionMessage.INVALID_SETTING}: ${invalidFlags.join(', ')}`,
        PermissionsExceptionCode.INVALID_SETTING,
        {
          userFriendlyMessage: msg`Some of the permissions you selected are not valid. Please try again with valid permission settings.`,
        },
      );
    }

    const roleUniversalIdentifier = role.universalIdentifier;

    const currentRolePermissionFlagsForRole = Object.values(
      flatRolePermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatRolePermissionFlag =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    const inputSet = new Set(input.permissionFlagKeys);
    const existingSet = new Set(
      currentRolePermissionFlagsForRole.map((pf) => pf.flag),
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatEntityToCreate = input.permissionFlagKeys
      .filter((flag) => !existingSet.has(flag))
      .map((flag) =>
        fromCreateRolePermissionFlagInputToFlatRolePermissionFlagToCreate({
          createRolePermissionFlagInput: { roleId: input.roleId, flag },
          flatApplication: workspaceCustomFlatApplication,
          flatRoleMaps,
        }),
      );

    const flatEntityToDelete = currentRolePermissionFlagsForRole.filter(
      (pf) => !inputSet.has(pf.flag),
    );

    if (flatEntityToCreate.length === 0 && flatEntityToDelete.length === 0) {
      const unchanged = currentRolePermissionFlagsForRole.filter((pf) =>
        inputSet.has(pf.flag),
      );
      return unchanged;
    }

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            rolePermissionFlag: {
              flatEntityToCreate,
              flatEntityToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (buildAndRunResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        buildAndRunResult,
        'Validation errors occurred while upserting permission flags',
      );
    }

    const { flatRolePermissionFlagMaps: freshFlatRolePermissionFlagMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRolePermissionFlagMaps'],
        },
      );

    const resultFlags = Object.values(
      freshFlatRolePermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatRolePermissionFlag =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    return resultFlags;
  }
}
