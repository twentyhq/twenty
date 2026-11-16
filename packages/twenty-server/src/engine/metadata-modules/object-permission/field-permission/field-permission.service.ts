import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatFieldPermissionMaps } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission-maps.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { fromCreateFieldPermissionInputToUniversalFlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/utils/from-create-field-permission-input-to-universal-flat-field-permission.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { filterFieldPermissionsOfInput } from 'src/engine/metadata-modules/object-permission/utils/filter-field-permissions-of-input.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

type DesiredFieldPermission = {
  objectMetadataId: string;
  fieldMetadataId: string;
  rowLevelPermissionPredicateGroupId: string | null;
  canReadFieldValue?: boolean | null;
  canUpdateFieldValue?: boolean | null;
};

const keyFrom = ({
  objectMetadataId,
  fieldMetadataId,
  rowLevelPermissionPredicateGroupId,
}: Pick<DesiredFieldPermission, 'objectMetadataId' | 'fieldMetadataId'> &
  Partial<
    Pick<DesiredFieldPermission, 'rowLevelPermissionPredicateGroupId'>
  >) =>
  `${objectMetadataId}:${fieldMetadataId}:${rowLevelPermissionPredicateGroupId ?? ''}`;

const toUniversalFlatFieldPermissionToDelete = (
  fieldPermission: FlatFieldPermission,
): UniversalFlatFieldPermission => ({
  universalIdentifier: fieldPermission.universalIdentifier,
  applicationUniversalIdentifier:
    fieldPermission.applicationUniversalIdentifier,
  roleUniversalIdentifier: fieldPermission.roleUniversalIdentifier,
  objectMetadataUniversalIdentifier:
    fieldPermission.objectMetadataUniversalIdentifier,
  fieldMetadataUniversalIdentifier:
    fieldPermission.fieldMetadataUniversalIdentifier,
  rowLevelPermissionPredicateGroupUniversalIdentifier:
    fieldPermission.rowLevelPermissionPredicateGroupUniversalIdentifier,
  rowLevelPermissionRuleUniversalIdentifier:
    fieldPermission.rowLevelPermissionRuleUniversalIdentifier,
  canReadFieldValue: fieldPermission.canReadFieldValue ?? undefined,
  canUpdateFieldValue: fieldPermission.canUpdateFieldValue ?? undefined,
  createdAt: fieldPermission.createdAt,
  updatedAt: fieldPermission.updatedAt,
});

@Injectable()
export class FieldPermissionService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async upsertFieldPermissions({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertFieldPermissionsInput;
  }): Promise<FlatFieldPermission[]> {
    const [flatMapsForRoleObjectField, flatFieldPermissionMapsResult] =
      await Promise.all([
        this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: [
              'flatRoleMaps',
              'flatObjectMetadataMaps',
              'flatFieldMetadataMaps',
              'flatRowLevelPermissionPredicateGroupMaps',
            ],
          },
        ),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatFieldPermissionMaps',
        ] as unknown as Parameters<WorkspaceCacheService['getOrRecompute']>[1]),
      ]);
    const flatRoleMaps = flatMapsForRoleObjectField.flatRoleMaps;
    const flatObjectMetadataMaps =
      flatMapsForRoleObjectField.flatObjectMetadataMaps;
    const flatFieldMetadataMaps =
      flatMapsForRoleObjectField.flatFieldMetadataMaps;
    const flatRowLevelPermissionPredicateGroupMaps =
      flatMapsForRoleObjectField.flatRowLevelPermissionPredicateGroupMaps;
    const flatFieldPermissionMapsResolved: FlatFieldPermissionMaps = (
      flatFieldPermissionMapsResult as unknown as {
        flatFieldPermissionMaps: FlatFieldPermissionMaps;
      }
    ).flatFieldPermissionMaps;

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    const roleUniversalIdentifier =
      flatRoleMaps.universalIdentifierById[input.roleId];
    const flatRole: FlatRole | undefined = isDefined(roleUniversalIdentifier)
      ? (flatRoleMaps.byUniversalIdentifier[roleUniversalIdentifier] as
          | FlatRole
          | undefined)
      : undefined;

    const currentFieldPermissionsForRole = Object.values(
      flatFieldPermissionMapsResolved.byUniversalIdentifier,
    ).filter(
      (fp): fp is FlatFieldPermission =>
        isDefined(fp) && fp.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    const desiredMap = new Map<string, DesiredFieldPermission>();

    for (const fieldPermission of input.fieldPermissions) {
      this.validateFieldPermission({
        allFieldPermissions: input.fieldPermissions,
        fieldPermission,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        rolesPermissions,
        flatRole,
      });

      const bothNull =
        (fieldPermission.canReadFieldValue === null ||
          fieldPermission.canReadFieldValue === undefined) &&
        (fieldPermission.canUpdateFieldValue === null ||
          fieldPermission.canUpdateFieldValue === undefined);

      if (bothNull) {
        continue;
      }

      desiredMap.set(keyFrom(fieldPermission), {
        objectMetadataId: fieldPermission.objectMetadataId,
        fieldMetadataId: fieldPermission.fieldMetadataId,
        rowLevelPermissionPredicateGroupId:
          fieldPermission.rowLevelPermissionPredicateGroupId ?? null,
        canReadFieldValue: fieldPermission.canReadFieldValue,
        canUpdateFieldValue: fieldPermission.canUpdateFieldValue,
      });
    }

    const mirroredFieldKeys = this.addRelatedFieldPermissionsToDesired({
      desiredMap,
      inputFieldPermissions: input.fieldPermissions,
      flatFieldMetadataMaps,
    });

    const inputFieldKeys = new Set(
      input.fieldPermissions.map((fp) => keyFrom(fp)),
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatEntityToCreate: (UniversalFlatFieldPermission & {
      id: string;
    })[] = [];
    const flatEntityToUpdate: UniversalFlatFieldPermission[] = [];
    const flatEntityToDelete: UniversalFlatFieldPermission[] = [];

    const currentByKey = new Map(
      currentFieldPermissionsForRole.map((fp) => [keyFrom(fp), fp]),
    );

    for (const [key, desired] of desiredMap) {
      const current = currentByKey.get(key);

      if (!isDefined(current)) {
        const canReadFieldValue = desired.canReadFieldValue ?? null;
        const canUpdateFieldValue = desired.canUpdateFieldValue ?? null;

        if (!isDefined(canReadFieldValue) && !isDefined(canUpdateFieldValue)) {
          continue;
        }

        flatEntityToCreate.push(
          fromCreateFieldPermissionInputToUniversalFlatFieldPermission({
            fieldPermissionInput: {
              objectMetadataId: desired.objectMetadataId,
              fieldMetadataId: desired.fieldMetadataId,
              rowLevelPermissionPredicateGroupId:
                desired.rowLevelPermissionPredicateGroupId,
              canReadFieldValue,
              canUpdateFieldValue,
            },
            roleId: input.roleId,
            flatApplication: workspaceCustomFlatApplication,
            flatRoleMaps,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            flatRowLevelPermissionPredicateGroupMaps,
          }),
        );
      } else {
        const effectiveCanRead =
          desired.canReadFieldValue !== undefined
            ? desired.canReadFieldValue
            : current.canReadFieldValue;
        const effectiveCanUpdate =
          desired.canUpdateFieldValue !== undefined
            ? desired.canUpdateFieldValue
            : current.canUpdateFieldValue;

        if (!isDefined(effectiveCanRead) && !isDefined(effectiveCanUpdate)) {
          // The mirror pass only owns rows it could have written itself; another application's row is left alone
          const isForeignMirroredRow =
            mirroredFieldKeys.has(key) &&
            !inputFieldKeys.has(key) &&
            current.applicationUniversalIdentifier !==
              workspaceCustomFlatApplication.universalIdentifier;

          if (!isForeignMirroredRow) {
            flatEntityToDelete.push(
              toUniversalFlatFieldPermissionToDelete(current),
            );
          }

          continue;
        }

        const changed =
          effectiveCanRead !== current.canReadFieldValue ||
          effectiveCanUpdate !== current.canUpdateFieldValue;

        if (changed) {
          const now = new Date().toISOString();
          flatEntityToUpdate.push({
            universalIdentifier: current.universalIdentifier,
            applicationUniversalIdentifier:
              current.applicationUniversalIdentifier,
            roleUniversalIdentifier: current.roleUniversalIdentifier,
            objectMetadataUniversalIdentifier:
              current.objectMetadataUniversalIdentifier,
            fieldMetadataUniversalIdentifier:
              current.fieldMetadataUniversalIdentifier,
            rowLevelPermissionPredicateGroupUniversalIdentifier:
              current.rowLevelPermissionPredicateGroupUniversalIdentifier,
            rowLevelPermissionRuleUniversalIdentifier:
              current.rowLevelPermissionRuleUniversalIdentifier,
            canReadFieldValue: effectiveCanRead,
            canUpdateFieldValue: effectiveCanUpdate,
            createdAt: current.createdAt,
            updatedAt: now,
          });
        }
      }
    }

    for (const current of currentFieldPermissionsForRole) {
      const key = keyFrom(current);

      if (inputFieldKeys.has(key) && !desiredMap.has(key)) {
        flatEntityToDelete.push(
          toUniversalFlatFieldPermissionToDelete(current),
        );
      }
    }

    if (
      flatEntityToCreate.length === 0 &&
      flatEntityToUpdate.length === 0 &&
      flatEntityToDelete.length === 0
    ) {
      return filterFieldPermissionsOfInput({
        fieldPermissions: currentFieldPermissionsForRole,
        input,
      });
    }

    const buildAndRunResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldPermission: {
              flatEntityToCreate,
              flatEntityToUpdate,
              flatEntityToDelete,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        } as Parameters<
          WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunWorkspaceMigration']
        >[0],
      );

    if (buildAndRunResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        buildAndRunResult,
        'Validation errors occurred while upserting field permissions',
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
    ]);

    const freshFlatFieldPermissionMaps: FlatFieldPermissionMaps = (
      (await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldPermissionMaps',
      ] as unknown as Parameters<
        WorkspaceCacheService['getOrRecompute']
      >[1])) as unknown as { flatFieldPermissionMaps: FlatFieldPermissionMaps }
    ).flatFieldPermissionMaps;

    const resultFieldPermissions = Object.values(
      freshFlatFieldPermissionMaps.byUniversalIdentifier,
    ).filter(
      (fp): fp is FlatFieldPermission =>
        isDefined(fp) && fp.roleUniversalIdentifier === roleUniversalIdentifier,
    );

    return filterFieldPermissionsOfInput({
      fieldPermissions: resultFieldPermissions,
      input,
    });
  }

  private validateFieldPermission({
    allFieldPermissions,
    fieldPermission,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    rolesPermissions,
    flatRole,
  }: {
    allFieldPermissions: UpsertFieldPermissionsInput['fieldPermissions'];
    fieldPermission: UpsertFieldPermissionsInput['fieldPermissions'][0];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
    rolesPermissions: Record<string, RoleRecordsPermissions> | undefined;
    flatRole: { id: string } | undefined;
  }) {
    const duplicateFieldPermissions = allFieldPermissions.filter(
      (permission) => keyFrom(permission) === keyFrom(fieldPermission),
    );

    if (duplicateFieldPermissions.length > 1) {
      throw new UserInputError(
        `Cannot accept more than one fieldPermission for field ${fieldPermission.fieldMetadataId} in input.`,
      );
    }

    if (
      (isDefined(fieldPermission.canUpdateFieldValue) &&
        fieldPermission.canUpdateFieldValue !== false) ||
      (isDefined(fieldPermission.canReadFieldValue) &&
        fieldPermission.canReadFieldValue !== false)
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ONLY_FIELD_RESTRICTION_ALLOWED,
        PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
        {
          userFriendlyMessage: msg`Field permissions can only be used to restrict access, not to grant additional permissions.`,
        },
      );
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldPermission.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        {
          userFriendlyMessage: msg`The object you are trying to set permissions for could not be found. It may have been deleted.`,
        },
      );
    }

    if (flatObjectMetadata.isSystem === true) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
        PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
        {
          userFriendlyMessage: msg`You cannot set field permissions on system objects as they are managed by the platform.`,
        },
      );
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldPermission.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.FIELD_METADATA_NOT_FOUND,
        PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
        {
          userFriendlyMessage: msg`The field you are trying to set permissions for could not be found. It may have been deleted.`,
        },
      );
    }

    if (
      isDefined(fieldPermission.rowLevelPermissionPredicateGroupId) &&
      (isDefined(fieldPermission.canReadFieldValue) ||
        isDefined(fieldPermission.canUpdateFieldValue))
    ) {
      this.validateRlsRuleFieldPermissionOrThrow({
        rowLevelPermissionPredicateGroupId:
          fieldPermission.rowLevelPermissionPredicateGroupId,
        flatFieldMetadata,
        flatRowLevelPermissionPredicateGroupMaps,
        roleId: flatRole?.id,
      });
    }

    const rolePermissionOnObject = isDefined(flatRole)
      ? rolesPermissions?.[flatRole.id]?.objects[
          fieldPermission.objectMetadataId
        ]
      : undefined;

    if (isDefined(flatRole) && !isDefined(rolePermissionOnObject)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_PERMISSION_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND,
        {
          userFriendlyMessage: msg`No permissions are set for this role on the selected object. Please set object permissions first.`,
        },
      );
    }
  }

  private validateRlsRuleFieldPermissionOrThrow({
    rowLevelPermissionPredicateGroupId,
    flatFieldMetadata,
    flatRowLevelPermissionPredicateGroupMaps,
    roleId,
  }: {
    rowLevelPermissionPredicateGroupId: string;
    flatFieldMetadata: FlatFieldMetadata;
    flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
    roleId: string | undefined;
  }) {
    const flatRowLevelPermissionPredicateGroup =
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: rowLevelPermissionPredicateGroupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      });

    if (
      !isDefined(flatRowLevelPermissionPredicateGroup) ||
      isDefined(flatRowLevelPermissionPredicateGroup.deletedAt) ||
      isDefined(
        flatRowLevelPermissionPredicateGroup.parentRowLevelPermissionPredicateGroupId,
      ) ||
      flatRowLevelPermissionPredicateGroup.roleId !== roleId ||
      flatRowLevelPermissionPredicateGroup.objectMetadataId !==
        flatFieldMetadata.objectMetadataId
    ) {
      throw new PermissionsException(
        'Field permissions can only target a root row level permission group of the same role and object',
        PermissionsExceptionCode.INVALID_ARG,
        {
          userFriendlyMessage: msg`This row level permission rule does not belong to this role and object.`,
        },
      );
    }

    // An unreadable column reads as null, which a required field cannot return, and a join would still read through an unreadable relation
    if (
      flatFieldMetadata.isNullable === false ||
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)
    ) {
      throw new PermissionsException(
        `Field ${flatFieldMetadata.name} cannot be restricted on a row level permission rule`,
        PermissionsExceptionCode.INVALID_ARG,
        {
          userFriendlyMessage: msg`Required fields and relations cannot be restricted on a row level permission rule.`,
        },
      );
    }
  }

  private addRelatedFieldPermissionsToDesired({
    desiredMap,
    inputFieldPermissions,
    flatFieldMetadataMaps,
  }: {
    desiredMap: Map<string, DesiredFieldPermission>;
    inputFieldPermissions: UpsertFieldPermissionsInput['fieldPermissions'];
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Set<string> {
    const inputKeys = new Set(
      inputFieldPermissions.map((inputFieldPermission) =>
        keyFrom(inputFieldPermission),
      ),
    );
    const mirroredKeys = new Set<string>();

    for (const fieldPermission of inputFieldPermissions) {
      // An RLS rule filters one object, so it has no meaning on the other side of a relation
      if (isDefined(fieldPermission.rowLevelPermissionPredicateGroupId)) {
        continue;
      }

      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldPermission.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.type !== FieldMetadataType.RELATION
      ) {
        continue;
      }

      const relationType = (
        flatFieldMetadata.settings as { relationType?: string } | undefined
      )?.relationType;
      if (
        relationType !== RelationType.ONE_TO_MANY &&
        relationType !== RelationType.MANY_TO_ONE
      ) {
        continue;
      }

      const targetObjectId =
        flatFieldMetadata.relationTargetObjectMetadataId ?? undefined;
      const targetFieldId =
        flatFieldMetadata.relationTargetFieldMetadataId ?? undefined;

      if (!targetObjectId || !targetFieldId) {
        continue;
      }

      const targetKey = keyFrom({
        objectMetadataId: targetObjectId,
        fieldMetadataId: targetFieldId,
      });
      if (inputKeys.has(targetKey)) {
        const targetInInput = inputFieldPermissions.find(
          (inputFieldPermission) => keyFrom(inputFieldPermission) === targetKey,
        );
        if (isDefined(targetInInput)) {
          const hasConflict =
            fieldPermission.canReadFieldValue !==
              targetInInput.canReadFieldValue ||
            fieldPermission.canUpdateFieldValue !==
              targetInInput.canUpdateFieldValue;
          if (hasConflict) {
            throw new UserInputError(
              'Conflicting field permissions found for relation target field',
              {
                userFriendlyMessage: msg`Contradicting field permissions have been detected on a relation field.`,
              },
            );
          }
        }
        continue;
      }

      // The bothNull gate drops a cleared source row from desiredMap, so the mirror must be cleared explicitly or it orphans
      const sourceIsCleared =
        !isDefined(fieldPermission.canReadFieldValue) &&
        !isDefined(fieldPermission.canUpdateFieldValue);

      desiredMap.set(targetKey, {
        objectMetadataId: targetObjectId,
        fieldMetadataId: targetFieldId,
        rowLevelPermissionPredicateGroupId: null,
        canReadFieldValue: sourceIsCleared
          ? null
          : fieldPermission.canReadFieldValue,
        canUpdateFieldValue: sourceIsCleared
          ? null
          : fieldPermission.canUpdateFieldValue,
      });
      mirroredKeys.add(targetKey);
    }

    return mirroredKeys;
  }
}
