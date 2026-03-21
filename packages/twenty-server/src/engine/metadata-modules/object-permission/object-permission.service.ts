import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { fromCreateObjectPermissionInputToUniversalFlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/utils/from-create-object-permission-input-to-universal-flat-object-permission.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import {
  type ObjectPermissionInput,
  type UpsertObjectPermissionsInput,
} from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';

@Injectable()
export class ObjectPermissionService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async upsertObjectPermissions({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertObjectPermissionsInput;
  }): Promise<FlatObjectPermission[]> {
    const { flatObjectPermissionMaps, flatRoleMaps, flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectPermissionMaps',
            'flatRoleMaps',
            'flatObjectMetadataMaps',
          ],
        },
      );

    const roleUniversalIdentifier =
      flatRoleMaps.universalIdentifierById[input.roleId];
    const flatRole = isDefined(roleUniversalIdentifier)
      ? flatRoleMaps.byUniversalIdentifier[roleUniversalIdentifier]
      : undefined;

    if (!isDefined(flatRole)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
        {
          userFriendlyMessage: msg`The role you are trying to modify could not be found.`,
        },
      );
    }

    const currentObjectPermissionsForRole = Object.values(
      flatObjectPermissionMaps.byUniversalIdentifier,
    ).filter(
      (op): op is FlatObjectPermission =>
        isDefined(op) && op.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    this.validateObjectPermissionsReadAndWriteConsistencyOrThrow({
      objectPermissions: input.objectPermissions,
      flatRole,
      currentObjectPermissionsForRole,
    });

    const flatApplication =
      await this.getFlatApplicationForWorkspace(workspaceId);

    const desiredByObjectMetadataId = new Map(
      input.objectPermissions.map((op) => [op.objectMetadataId, op]),
    );

    for (const desired of input.objectPermissions) {
      const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: desired.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(objectMetadata)) {
        throw new PermissionsException(
          'Object metadata id not found',
          PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
          {
            userFriendlyMessage: msg`The object you are trying to set permissions for could not be found. It may have been deleted.`,
          },
        );
      }

      if (objectMetadata.isSystem === true) {
        throw new PermissionsException(
          PermissionsExceptionMessage.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
          PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
          {
            userFriendlyMessage: msg`You cannot set permissions on system objects as they are managed by the platform.`,
          },
        );
      }
    }

    const flatEntityToCreate: (UniversalFlatObjectPermission & {
      id: string;
    })[] = [];
    const flatEntityToUpdate: UniversalFlatObjectPermission[] = [];
    const flatEntityToDelete: UniversalFlatObjectPermission[] = [];

    const currentByObjectMetadataId = new Map(
      currentObjectPermissionsForRole.map((op) => [op.objectMetadataId, op]),
    );

    for (const desired of input.objectPermissions) {
      const current = currentByObjectMetadataId.get(desired.objectMetadataId);

      if (!isDefined(current)) {
        flatEntityToCreate.push(
          fromCreateObjectPermissionInputToUniversalFlatObjectPermission({
            createObjectPermissionInput: {
              roleId: input.roleId,
              objectMetadataId: desired.objectMetadataId,
              canReadObjectRecords: desired.canReadObjectRecords,
              canUpdateObjectRecords: desired.canUpdateObjectRecords,
              canSoftDeleteObjectRecords: desired.canSoftDeleteObjectRecords,
              canDestroyObjectRecords: desired.canDestroyObjectRecords,
            },
            flatApplication,
            flatRoleMaps,
            flatObjectMetadataMaps,
          }),
        );
      } else {
        const effectiveCanRead =
          desired.canReadObjectRecords ?? current.canReadObjectRecords;
        const effectiveCanUpdate =
          desired.canUpdateObjectRecords ?? current.canUpdateObjectRecords;
        const effectiveCanSoftDelete =
          desired.canSoftDeleteObjectRecords ??
          current.canSoftDeleteObjectRecords;
        const effectiveCanDestroy =
          desired.canDestroyObjectRecords ?? current.canDestroyObjectRecords;

        const canChanged =
          effectiveCanRead !== current.canReadObjectRecords ||
          effectiveCanUpdate !== current.canUpdateObjectRecords ||
          effectiveCanSoftDelete !== current.canSoftDeleteObjectRecords ||
          effectiveCanDestroy !== current.canDestroyObjectRecords;

        if (canChanged) {
          const now = new Date().toISOString();
          flatEntityToUpdate.push({
            universalIdentifier: current.universalIdentifier,
            applicationUniversalIdentifier:
              current.applicationUniversalIdentifier,
            roleUniversalIdentifier: current.roleUniversalIdentifier,
            objectMetadataUniversalIdentifier:
              current.objectMetadataUniversalIdentifier,
            canReadObjectRecords: effectiveCanRead,
            canUpdateObjectRecords: effectiveCanUpdate,
            canSoftDeleteObjectRecords: effectiveCanSoftDelete,
            canDestroyObjectRecords: effectiveCanDestroy,
            createdAt: current.createdAt,
            updatedAt: now,
          });
        }
      }
    }

    for (const current of currentObjectPermissionsForRole) {
      if (!desiredByObjectMetadataId.has(current.objectMetadataId)) {
        flatEntityToDelete.push({
          universalIdentifier: current.universalIdentifier,
          applicationUniversalIdentifier:
            current.applicationUniversalIdentifier,
          roleUniversalIdentifier: current.roleUniversalIdentifier,
          objectMetadataUniversalIdentifier:
            current.objectMetadataUniversalIdentifier,
          canReadObjectRecords: current.canReadObjectRecords,
          canUpdateObjectRecords: current.canUpdateObjectRecords,
          canSoftDeleteObjectRecords: current.canSoftDeleteObjectRecords,
          canDestroyObjectRecords: current.canDestroyObjectRecords,
          createdAt: current.createdAt,
          updatedAt: current.updatedAt,
        });
      }
    }

    if (
      flatEntityToCreate.length === 0 &&
      flatEntityToUpdate.length === 0 &&
      flatEntityToDelete.length === 0
    ) {
      const unchanged = currentObjectPermissionsForRole.filter((op) =>
        desiredByObjectMetadataId.has(op.objectMetadataId),
      );
      return unchanged;
    }

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectPermission: {
              flatEntityToCreate,
              flatEntityToUpdate,
              flatEntityToDelete,
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
        'Validation errors occurred while upserting object permissions',
      );
    }

    const { flatObjectPermissionMaps: freshFlatObjectPermissionMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectPermissionMaps'],
        },
      );

    const resultObjectPermissions = Object.values(
      freshFlatObjectPermissionMaps.byUniversalIdentifier,
    ).filter(
      (op): op is FlatObjectPermission =>
        isDefined(op) && op.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    const desiredObjectMetadataIds = new Set(
      input.objectPermissions.map((op) => op.objectMetadataId),
    );
    const filtered = resultObjectPermissions.filter((op) =>
      desiredObjectMetadataIds.has(op.objectMetadataId),
    );

    return filtered;
  }

  private validateObjectPermissionsReadAndWriteConsistencyOrThrow({
    objectPermissions: newObjectPermissions,
    flatRole,
    currentObjectPermissionsForRole,
  }: {
    objectPermissions: ObjectPermissionInput[];
    flatRole: Pick<
      FlatRole,
      | 'canReadAllObjectRecords'
      | 'canUpdateAllObjectRecords'
      | 'canSoftDeleteAllObjectRecords'
      | 'canDestroyAllObjectRecords'
    >;
    currentObjectPermissionsForRole: FlatObjectPermission[];
  }): void {
    for (const newObjectPermission of newObjectPermissions) {
      const existingObjectRecordPermission =
        currentObjectPermissionsForRole.find(
          (objectPermission) =>
            objectPermission.objectMetadataId ===
            newObjectPermission.objectMetadataId,
        );

      const hasReadPermissionAfterUpdate =
        newObjectPermission.canReadObjectRecords ??
        existingObjectRecordPermission?.canReadObjectRecords ??
        flatRole.canReadAllObjectRecords;

      if (hasReadPermissionAfterUpdate === false) {
        const hasUpdatePermissionAfterUpdate =
          newObjectPermission.canUpdateObjectRecords ??
          existingObjectRecordPermission?.canUpdateObjectRecords ??
          flatRole.canUpdateAllObjectRecords;

        const hasSoftDeletePermissionAfterUpdate =
          newObjectPermission.canSoftDeleteObjectRecords ??
          existingObjectRecordPermission?.canSoftDeleteObjectRecords ??
          flatRole.canSoftDeleteAllObjectRecords;

        const hasDestroyPermissionAfterUpdate =
          newObjectPermission.canDestroyObjectRecords ??
          existingObjectRecordPermission?.canDestroyObjectRecords ??
          flatRole.canDestroyAllObjectRecords;

        if (
          hasUpdatePermissionAfterUpdate ||
          hasSoftDeletePermissionAfterUpdate ||
          hasDestroyPermissionAfterUpdate
        ) {
          throw new PermissionsException(
            PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
            PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
            {
              userFriendlyMessage: msg`You cannot grant edit permissions without also granting read permissions. Please enable read access first.`,
            },
          );
        }
      }
    }
  }

  private async getFlatApplicationForWorkspace(workspaceId: string) {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    return workspaceCustomFlatApplication;
  }
}
