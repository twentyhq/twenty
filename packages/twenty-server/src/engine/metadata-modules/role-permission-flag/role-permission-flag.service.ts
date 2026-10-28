import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import uniqBy from 'lodash.uniqby';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { fromCreateRolePermissionFlagInputToFlatRolePermissionFlagToCreate } from 'src/engine/metadata-modules/flat-role-permission-flag/utils/from-create-role-permission-flag-input-to-flat-role-permission-flag-to-create.util';
import { PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-type-by-legacy-standard-key.constant';
import { resolvePermissionFlagKey } from 'src/engine/metadata-modules/permission-flag/utils/resolve-permission-flag-key.util';
import { type UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/role-permission-flag/dtos/upsert-permission-flags.input';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Old clients still send the pre-2.53 keys; delete once
// upgrade:2-53:rename-app-permission-flag-keys leaves the cross-upgrade window
const PERMISSION_FLAG_TYPE_BY_LEGACY_KEY = new Map<string, string>(
  Object.entries(PERMISSION_FLAG_TYPE_BY_LEGACY_STANDARD_KEY),
);

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
    const permissionFlags = Object.values(
      flatPermissionFlagMaps.byUniversalIdentifier,
    ).filter(isDefined);
    const permissionFlagByKey = new Map(
      permissionFlags.map((permissionFlag) => [
        resolvePermissionFlagKey(permissionFlag),
        permissionFlag,
      ]),
    );
    const permissionFlagsByInputKey = input.permissionFlagKeys.map((flag) => {
      const key = PERMISSION_FLAG_TYPE_BY_LEGACY_KEY.get(flag) ?? flag;

      return { flag, key, permissionFlag: permissionFlagByKey.get(key) };
    });
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

    await this.throwIfAnyPermissionFlagKeyIsAmbiguous({
      workspaceId,
      permissionFlags,
      requestedKeys: permissionFlagsByInputKey,
    });

    const requestedPermissionFlags = uniqBy(
      permissionFlagsByInputKey
        .map(({ permissionFlag }) => permissionFlag)
        .filter(isDefined),
      'universalIdentifier',
    );

    const currentRolePermissionFlagsForRole = Object.values(
      flatRolePermissionFlagMaps.byUniversalIdentifier,
    ).filter(
      (pf): pf is FlatRolePermissionFlag =>
        isDefined(pf) && pf.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    const inputSet = new Set(
      requestedPermissionFlags.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
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

    const flatEntityToCreate = requestedPermissionFlags
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

  // upgrade:2-53:rename-app-permission-flag-keys: a standard flag still stored under its
  // old key, or an app flag stored under a legacy key, can share a requested key; fail closed
  private async throwIfAnyPermissionFlagKeyIsAmbiguous({
    workspaceId,
    permissionFlags,
    requestedKeys,
  }: {
    workspaceId: string;
    permissionFlags: FlatPermissionFlag[];
    requestedKeys: { flag: string; key: string }[];
  }): Promise<void> {
    const collisions = uniqBy(
      uniqBy(requestedKeys, 'flag').flatMap(({ flag, key }) => {
        const permissionFlagsWithKey = permissionFlags.filter(
          (permissionFlag) => {
            const resolvedKey = resolvePermissionFlagKey(permissionFlag);

            return resolvedKey === key || resolvedKey === flag;
          },
        );

        return permissionFlagsWithKey.length > 1
          ? [
              {
                key,
                appPermissionFlags: permissionFlagsWithKey.filter(
                  (permissionFlag) =>
                    !belongsToTwentyStandardApp(permissionFlag),
                ),
              },
            ]
          : [];
      }),
      'key',
    );

    if (!isNonEmptyArray(collisions)) {
      return;
    }

    const flatApplications =
      await this.applicationService.findManyInstalledFlatApplications(
        workspaceId,
      );
    const applicationNameById = new Map(
      flatApplications.map(({ id, name }) => [id, name]),
    );

    const collisionDescription = collisions
      .map(({ key, appPermissionFlags }) => {
        const applicationNames = appPermissionFlags.map(
          ({ applicationId, applicationUniversalIdentifier }) =>
            applicationNameById.get(applicationId) ??
            applicationUniversalIdentifier,
        );

        return `${key} (${applicationNames.join(', ')})`;
      })
      .join(', ');

    throw new PermissionsException(
      `Permission flag key(s) defined by both Twenty and an application: ${collisionDescription}. Revoke them from every role, then uninstall the application.`,
      PermissionsExceptionCode.INVALID_SETTING,
      {
        userFriendlyMessage: msg`These permissions are defined both by Twenty and by an installed application: ${collisionDescription}. Revoke them from every role, then uninstall the application.`,
      },
    );
  }
}
