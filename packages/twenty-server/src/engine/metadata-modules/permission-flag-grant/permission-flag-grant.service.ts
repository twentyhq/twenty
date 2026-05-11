import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatPermissionFlagGrant } from 'src/engine/metadata-modules/flat-permission-flag-grant/types/flat-permission-flag-grant.type';
import { fromCreatePermissionFlagGrantInputToFlatPermissionFlagGrantToCreate } from 'src/engine/metadata-modules/flat-permission-flag-grant/utils/from-create-permission-flag-grant-input-to-flat-permission-flag-grant-to-create.util';
import { type UpsertPermissionFlagGrantsInput } from 'src/engine/metadata-modules/permission-flag-grant/dtos/upsert-permission-flag-grant-input';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PermissionFlagGrantService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async upsertPermissionFlagGrants({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertPermissionFlagGrantsInput;
  }): Promise<FlatPermissionFlagGrant[]> {
    const { flatPermissionFlagGrantMaps, flatRoleMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagGrantMaps', 'flatRoleMaps'],
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

    const invalidFlags = input.permissionFlagGrantKeys.filter(
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

    const currentPermissionFlagGrantsForRole = Object.values(
      flatPermissionFlagGrantMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatPermissionFlagGrant =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    const inputSet = new Set(input.permissionFlagGrantKeys);
    const existingSet = new Set(
      currentPermissionFlagGrantsForRole.map((pf) => pf.flag),
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatEntityToCreate = input.permissionFlagGrantKeys
      .filter((flag) => !existingSet.has(flag))
      .map((flag) =>
        fromCreatePermissionFlagGrantInputToFlatPermissionFlagGrantToCreate({
          createPermissionFlagGrantInput: { roleId: input.roleId, flag },
          flatApplication: workspaceCustomFlatApplication,
          flatRoleMaps,
        }),
      );

    const flatEntityToDelete = currentPermissionFlagGrantsForRole.filter(
      (pf) => !inputSet.has(pf.flag),
    );

    if (flatEntityToCreate.length === 0 && flatEntityToDelete.length === 0) {
      const unchanged = currentPermissionFlagGrantsForRole.filter((pf) =>
        inputSet.has(pf.flag),
      );
      return unchanged;
    }

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlagGrant: {
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

    const { flatPermissionFlagGrantMaps: freshFlatPermissionFlagGrantMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagGrantMaps'],
        },
      );

    const resultFlags = Object.values(
      freshFlatPermissionFlagGrantMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatPermissionFlagGrant =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    return resultFlags;
  }
}
