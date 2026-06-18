import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
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
    const { flatPermissionFlagMaps, flatRolePermissionFlagMaps, flatRoleMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPermissionFlagMaps',
            'flatRolePermissionFlagMaps',
            'flatRoleMaps',
          ],
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

    const roleUniversalIdentifier = role.universalIdentifier;
    const permissionFlagByKey = new Map(
      Object.values(flatPermissionFlagMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((permissionFlag) => [permissionFlag.key, permissionFlag]),
    );
    const permissionFlagsByInputKey = input.permissionFlagKeys.map((flag) => ({
      flag,
      permissionFlag: permissionFlagByKey.get(flag),
    }));
    const missingPermissionFlags = permissionFlagsByInputKey
      .filter(({ permissionFlag }) => !isDefined(permissionFlag))
      .map(({ flag }) => flag);

    if (missingPermissionFlags.length > 0) {
      throw new PermissionsException(
        `${PermissionsExceptionMessage.INVALID_SETTING}: ${missingPermissionFlags.join(', ')}`,
        PermissionsExceptionCode.INVALID_SETTING,
        {
          userFriendlyMessage: msg`Some of the permissions you selected are not valid. Please try again with valid permission settings.`,
        },
      );
    }

    const currentRolePermissionFlagsForRole = Object.values(
      flatRolePermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatRolePermissionFlag =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    const inputSet = new Set(
      permissionFlagsByInputKey
        .map(({ permissionFlag }) => permissionFlag?.universalIdentifier)
        .filter(isDefined),
    );
    const existingSet = new Set(
      currentRolePermissionFlagsForRole.map(
        (pf) => pf.permissionFlagUniversalIdentifier,
      ),
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatEntityToCreate = permissionFlagsByInputKey
      .map(({ permissionFlag }) => permissionFlag)
      .filter(isDefined)
      .filter(
        (permissionFlag) =>
          !existingSet.has(permissionFlag.universalIdentifier),
      )
      .map((permissionFlag) =>
        fromCreateRolePermissionFlagInputToFlatRolePermissionFlagToCreate({
          createRolePermissionFlagInput: {
            roleId: input.roleId,
            permissionFlagId: permissionFlag.id,
          },
          flatApplication: workspaceCustomFlatApplication,
          flatPermissionFlagMaps,
          flatRoleMaps,
        }),
      );

    const flatEntityToDelete = currentRolePermissionFlagsForRole.filter(
      (pf) => !inputSet.has(pf.permissionFlagUniversalIdentifier),
    );

    if (flatEntityToCreate.length === 0 && flatEntityToDelete.length === 0) {
      return currentRolePermissionFlagsForRole.filter((pf) =>
        inputSet.has(pf.permissionFlagUniversalIdentifier),
      );
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
