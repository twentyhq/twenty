/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RowLevelPermissionPredicateGroupExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate-group.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

@Injectable()
export class FlatRowLevelPermissionPredicateGroupValidatorService {
  validateFlatRowLevelPermissionPredicateGroupCreation({
    flatEntityToValidate: flatPredicateGroupToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicateGroup', 'create'> {
    const {
      flatRowLevelPermissionPredicateGroupMaps:
        optimisticFlatPredicateGroupMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatPredicateGroupToValidate.id,
        universalIdentifier: flatPredicateGroupToValidate.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicateGroup',
      type: 'create',
    });

    const existingPredicateGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatPredicateGroupToValidate.id,
      flatEntityMaps: optimisticFlatPredicateGroupMaps,
    });

    if (isDefined(existingPredicateGroup)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
        message: t`Row level permission predicate group with this id already exists`,
        userFriendlyMessage: msg`Row level permission predicate group with this id already exists`,
      });
    }

    if (
      isDefined(
        flatPredicateGroupToValidate.parentRowLevelPermissionPredicateGroupId,
      )
    ) {
      const parentGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          flatPredicateGroupToValidate.parentRowLevelPermissionPredicateGroupId,
        flatEntityMaps: optimisticFlatPredicateGroupMaps,
      });

      if (!isDefined(parentGroup)) {
        validationResult.errors.push({
          code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
          message: t`Parent row level permission predicate group not found`,
          userFriendlyMessage: msg`Parent row level permission predicate group not found`,
        });
      }
    }

    const role = flatRoleMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatPredicateGroupToValidate.roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

    if (!isDefined(role)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    }

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatPredicateGroupToValidate.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    return validationResult;
  }

  validateFlatRowLevelPermissionPredicateGroupDeletion({
    flatEntityToValidate: flatPredicateGroupToDelete,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicateGroup', 'delete'> {
    const {
      flatRowLevelPermissionPredicateGroupMaps:
        optimisticFlatPredicateGroupMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatPredicateGroupToDelete.id,
        universalIdentifier: flatPredicateGroupToDelete.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicateGroup',
      type: 'delete',
    });

    const existingPredicateGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatPredicateGroupToDelete.id,
      flatEntityMaps: optimisticFlatPredicateGroupMaps,
    });

    if (!isDefined(existingPredicateGroup)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND,
        message: t`Row level permission predicate group to delete not found`,
        userFriendlyMessage: msg`Row level permission predicate group to delete not found`,
      });
    }

    return validationResult;
  }

  validateFlatRowLevelPermissionPredicateGroupUpdate({
    flatEntityId,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicateGroup
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicateGroup', 'update'> {
    const {
      flatRowLevelPermissionPredicateGroupMaps:
        optimisticFlatPredicateGroupMaps,
      flatRoleMaps,
      flatObjectMetadataMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;

    const existingPredicateGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatPredicateGroupMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingPredicateGroup?.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicateGroup',
      type: 'update',
    });

    if (!isDefined(existingPredicateGroup)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND,
        message: t`Row level permission predicate group to update not found`,
        userFriendlyMessage: msg`Row level permission predicate group to update not found`,
      });

      return validationResult;
    }

    const updatedPredicateGroup = {
      ...existingPredicateGroup,
      ...flatEntityUpdate,
    };

    if (updatedPredicateGroup.roleId !== existingPredicateGroup.roleId) {
      const existingRoleId = existingPredicateGroup.roleId;
      const updatedRoleId = updatedPredicateGroup.roleId;

      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.UNAUTHORIZED_ROLE_MODIFICATION,
        message: t`Cannot modify predicate group to change its role from ${existingRoleId} to ${updatedRoleId}`,
        userFriendlyMessage: msg`Cannot modify predicate group to change its role`,
      });
    }

    if (
      updatedPredicateGroup.objectMetadataId !==
      existingPredicateGroup.objectMetadataId
    ) {
      const existingObjectMetadataId = existingPredicateGroup.objectMetadataId;
      const updatedObjectMetadataId = updatedPredicateGroup.objectMetadataId;

      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.UNAUTHORIZED_OBJECT_MODIFICATION,
        message: t`Cannot modify predicate group to change its object from ${existingObjectMetadataId} to ${updatedObjectMetadataId}`,
        userFriendlyMessage: msg`Cannot modify predicate group to change its object`,
      });
    }

    if (
      isDefined(updatedPredicateGroup.parentRowLevelPermissionPredicateGroupId)
    ) {
      const parentGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          updatedPredicateGroup.parentRowLevelPermissionPredicateGroupId,
        flatEntityMaps: optimisticFlatPredicateGroupMaps,
      });

      if (!isDefined(parentGroup)) {
        validationResult.errors.push({
          code: RowLevelPermissionPredicateGroupExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA,
          message: t`Parent row level permission predicate group not found`,
          userFriendlyMessage: msg`Parent row level permission predicate group not found`,
        });
      }
    }

    const role = flatRoleMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: updatedPredicateGroup.roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

    if (!isDefined(role)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    }

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: updatedPredicateGroup.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateGroupExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    return validationResult;
  }
}
