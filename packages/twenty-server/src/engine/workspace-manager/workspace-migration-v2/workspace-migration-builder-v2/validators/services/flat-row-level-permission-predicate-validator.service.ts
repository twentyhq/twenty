/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RowLevelPermissionPredicateExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatRowLevelPermissionPredicateValidatorService {
  validateFlatRowLevelPermissionPredicateCreation({
    flatEntityToValidate: flatPredicateToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicate', 'create'> {
    const {
      flatRowLevelPermissionPredicateMaps: optimisticFlatPredicateMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRoleMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps as Partial<{
      flatRowLevelPermissionPredicateMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionPredicateMaps;
      flatFieldMetadataMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatFieldMetadataMaps;
      flatObjectMetadataMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatObjectMetadataMaps;
      flatRowLevelPermissionPredicateGroupMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionPredicateGroupMaps;
      flatRoleMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRoleMaps;
    }>;

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatPredicateToValidate.id,
        universalIdentifier: flatPredicateToValidate.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicate',
      type: 'create',
    });

    const existingPredicate =
      optimisticFlatPredicateMaps?.byId[flatPredicateToValidate.id];

    if (isDefined(existingPredicate)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Row level permission predicate with this id already exists`,
        userFriendlyMessage: msg`Row level permission predicate with this id already exists`,
      });
    }

    const fieldMetadata = flatFieldMetadataMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatPredicateToValidate.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (!isDefined(fieldMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatPredicateToValidate.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    if (
      isDefined(flatPredicateToValidate.rowLevelPermissionPredicateGroupId) &&
      flatRowLevelPermissionPredicateGroupMaps
    ) {
      const predicateGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          flatPredicateToValidate.rowLevelPermissionPredicateGroupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      });

      if (!isDefined(predicateGroup)) {
        validationResult.errors.push({
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`Row level permission predicate group not found`,
          userFriendlyMessage: msg`Row level permission predicate group not found`,
        });
      }
    }

    const role = flatRoleMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatPredicateToValidate.roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

    if (!isDefined(role)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    }

    return validationResult;
  }

  validateFlatRowLevelPermissionPredicateDeletion({
    flatEntityToValidate: flatPredicateToDelete,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicate', 'delete'> {
    const { flatRowLevelPermissionPredicateMaps: optimisticFlatPredicateMaps } =
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps as Partial<{
        flatRowLevelPermissionPredicateMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionPredicateMaps;
      }>;
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatPredicateToDelete.id,
        universalIdentifier: flatPredicateToDelete.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicate',
      type: 'delete',
    });

    const existingPredicate =
      optimisticFlatPredicateMaps?.byId[flatPredicateToDelete.id];

    if (!isDefined(existingPredicate)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND,
        message: t`Row level permission predicate to delete not found`,
        userFriendlyMessage: msg`Row level permission predicate to delete not found`,
      });
    }

    return validationResult;
  }

  validateFlatRowLevelPermissionPredicateUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicate', 'update'> {
    const {
      flatRowLevelPermissionPredicateMaps: optimisticFlatPredicateMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRoleMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps as Partial<{
      flatRowLevelPermissionPredicateMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionPredicateMaps;
      flatFieldMetadataMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatFieldMetadataMaps;
      flatObjectMetadataMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatObjectMetadataMaps;
      flatRowLevelPermissionPredicateGroupMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionPredicateGroupMaps;
      flatRoleMaps: typeof optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRoleMaps;
    }>;

    const existingPredicate = optimisticFlatPredicateMaps?.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingPredicate?.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicate',
      type: 'update',
    });

    if (!isDefined(existingPredicate)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND,
        message: t`Row level permission predicate to update not found`,
        userFriendlyMessage: msg`Row level permission predicate to update not found`,
      });

      return validationResult;
    }

    const updatedPredicate = {
      ...existingPredicate,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const fieldMetadata = flatFieldMetadataMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: updatedPredicate.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (!isDefined(fieldMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    }

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: updatedPredicate.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(objectMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    if (
      isDefined(updatedPredicate.rowLevelPermissionPredicateGroupId) &&
      flatRowLevelPermissionPredicateGroupMaps
    ) {
      const predicateGroup = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: updatedPredicate.rowLevelPermissionPredicateGroupId,
        flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
      });

      if (!isDefined(predicateGroup)) {
        validationResult.errors.push({
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`Row level permission predicate group not found`,
          userFriendlyMessage: msg`Row level permission predicate group not found`,
        });
      }
    }

    const role = flatRoleMaps
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: updatedPredicate.roleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

    if (!isDefined(role)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    }

    return validationResult;
  }
}
