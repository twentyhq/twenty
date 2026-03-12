import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { fromCreatePermissionFlagInputToFlatPermissionFlagToCreate } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-create-permission-flag-input-to-flat-permission-flag-to-create.util';
import { type PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { type UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/permission-flag/dtos/upsert-permission-flag-input';
import { fromFlatPermissionFlagToPermissionFlagDto } from 'src/engine/metadata-modules/permission-flag/utils/from-flat-permission-flag-to-permission-flag-dto.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PermissionFlagService {
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
  }): Promise<PermissionFlagDTO[]> {
    const { flatPermissionFlagMaps, flatRoleMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps', 'flatRoleMaps'],
        },
      );

    const roleUniversalId = flatRoleMaps.universalIdentifierById[input.roleId];
    const roleById = isDefined(roleUniversalId)
      ? flatRoleMaps.byUniversalIdentifier[roleUniversalId]
      : undefined;

    if (!isDefined(roleById)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
        {
          userFriendlyMessage: msg`The role you are trying to modify could not be found.`,
        },
      );
    }

    if (!roleById.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        {
          userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
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

    const roleUniversalIdentifier = roleById.universalIdentifier;

    const currentPermissionFlagsForRole = Object.values(
      flatPermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatPermissionFlag =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    const inputSet = new Set(input.permissionFlagKeys);
    const existingSet = new Set(
      currentPermissionFlagsForRole.map((pf) => pf.flag),
    );

    const flatApplication =
      await this.getFlatApplicationForWorkspace(workspaceId);

    const flatEntityToCreate = input.permissionFlagKeys
      .filter((flag) => !existingSet.has(flag))
      .map((flag) =>
        fromCreatePermissionFlagInputToFlatPermissionFlagToCreate({
          createPermissionFlagInput: { roleId: input.roleId, flag },
          flatApplication,
          flatRoleMaps,
        }),
      );

    const flatEntityToDelete = currentPermissionFlagsForRole.filter(
      (pf) => !inputSet.has(pf.flag),
    );

    if (flatEntityToCreate.length === 0 && flatEntityToDelete.length === 0) {
      const unchanged = currentPermissionFlagsForRole.filter((pf) =>
        inputSet.has(pf.flag),
      );
      return unchanged.map(fromFlatPermissionFlagToPermissionFlagDto);
    }

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            permissionFlag: {
              flatEntityToCreate,
              flatEntityToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        },
      );

    if (buildAndRunResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        buildAndRunResult,
        'Validation errors occurred while upserting permission flags',
      );
    }

    const { flatPermissionFlagMaps: freshFlatPermissionFlagMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    const resultFlags = Object.values(
      freshFlatPermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatPermissionFlag =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    return resultFlags.map(fromFlatPermissionFlagToPermissionFlagDto);
  }

  private async getFlatApplicationForWorkspace(workspaceId: string) {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    return workspaceCustomFlatApplication;
  }
}
