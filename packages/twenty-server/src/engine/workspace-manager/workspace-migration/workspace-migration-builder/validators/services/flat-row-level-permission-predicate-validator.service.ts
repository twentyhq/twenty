/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import {
  type FieldMetadataType,
  type RowLevelPermissionPredicateOperand,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import {
  convertViewFilterValueToString,
  getFilterValueValidationIssue,
  isDefined,
  isRecordFilterOperandExpectingValue,
} from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { RowLevelPermissionPredicateExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatRowLevelPermissionPredicateValidatorService {
  validateFlatRowLevelPermissionPredicateCreation({
    flatEntityToValidate: flatPredicateToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicate', 'create'> {
    const {
      flatRowLevelPermissionPredicateMaps: optimisticFlatPredicateMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatRoleMaps,
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPredicateToValidate.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicate',
      type: 'create',
    });

    const existingPredicate = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPredicateToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatPredicateMaps,
    });

    if (isDefined(existingPredicate)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Row level permission predicate with this universal identifier already exists`,
        userFriendlyMessage: msg`Row level permission predicate already exists`,
      });
    }

    const fieldMetadata = flatFieldMetadataMaps
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            flatPredicateToValidate.fieldMetadataUniversalIdentifier,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (!isDefined(fieldMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    } else {
      const invalidValueError = this.getInvalidValueError({
        fieldType: fieldMetadata.type,
        operand: flatPredicateToValidate.operand,
        subFieldName: flatPredicateToValidate.subFieldName,
        value: flatPredicateToValidate.value,
        workspaceMemberFieldMetadataUniversalIdentifier:
          flatPredicateToValidate.workspaceMemberFieldMetadataUniversalIdentifier,
      });

      if (isDefined(invalidValueError)) {
        validationResult.errors.push(invalidValueError);
      }
    }

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            flatPredicateToValidate.objectMetadataUniversalIdentifier,
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
      isDefined(
        flatPredicateToValidate.rowLevelPermissionPredicateGroupUniversalIdentifier,
      ) &&
      flatRowLevelPermissionPredicateGroupMaps
    ) {
      const predicateGroup = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatPredicateToValidate.rowLevelPermissionPredicateGroupUniversalIdentifier,
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
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: flatPredicateToValidate.roleUniversalIdentifier,
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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionPredicate
  >): FailedFlatEntityValidation<'rowLevelPermissionPredicate', 'delete'> {
    const { flatRowLevelPermissionPredicateMaps: optimisticFlatPredicateMaps } =
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps;
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPredicateToDelete.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionPredicate',
      type: 'delete',
    });

    const existingPredicate = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatPredicateToDelete.universalIdentifier,
      flatEntityMaps: optimisticFlatPredicateMaps,
    });

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
    universalIdentifier,
    flatEntityUpdate,
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
    } = optimisticFlatEntityMapsAndRelatedFlatEntityMaps;

    const existingPredicate = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPredicateMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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
      ...flatEntityUpdate,
    };

    if (
      updatedPredicate.roleUniversalIdentifier !==
      existingPredicate.roleUniversalIdentifier
    ) {
      const existingRoleIdentifier = existingPredicate.roleUniversalIdentifier;
      const updatedRoleIdentifier = updatedPredicate.roleUniversalIdentifier;

      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_ROLE_MODIFICATION,
        message: t`Cannot modify predicate to change its role from ${existingRoleIdentifier} to ${updatedRoleIdentifier}`,
        userFriendlyMessage: msg`Cannot modify predicate to change its role`,
      });
    }

    if (
      updatedPredicate.objectMetadataUniversalIdentifier !==
      existingPredicate.objectMetadataUniversalIdentifier
    ) {
      const existingObjectMetadataIdentifier =
        existingPredicate.objectMetadataUniversalIdentifier;
      const updatedObjectMetadataIdentifier =
        updatedPredicate.objectMetadataUniversalIdentifier;

      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_OBJECT_MODIFICATION,
        message: t`Cannot modify predicate to change its object from ${existingObjectMetadataIdentifier} to ${updatedObjectMetadataIdentifier}`,
        userFriendlyMessage: msg`Cannot modify predicate to change its object`,
      });
    }

    const fieldMetadata = flatFieldMetadataMaps
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            updatedPredicate.fieldMetadataUniversalIdentifier,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (!isDefined(fieldMetadata)) {
      validationResult.errors.push({
        code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Field metadata not found`,
        userFriendlyMessage: msg`Field metadata not found`,
      });
    } else if (
      'value' in flatEntityUpdate ||
      'operand' in flatEntityUpdate ||
      'fieldMetadataUniversalIdentifier' in flatEntityUpdate ||
      'subFieldName' in flatEntityUpdate ||
      'workspaceMemberFieldMetadataUniversalIdentifier' in flatEntityUpdate
    ) {
      const invalidValueError = this.getInvalidValueError({
        fieldType: fieldMetadata.type,
        operand: updatedPredicate.operand,
        subFieldName: updatedPredicate.subFieldName,
        value: updatedPredicate.value,
        workspaceMemberFieldMetadataUniversalIdentifier:
          updatedPredicate.workspaceMemberFieldMetadataUniversalIdentifier,
      });

      if (isDefined(invalidValueError)) {
        validationResult.errors.push(invalidValueError);
      }
    }

    const objectMetadata = flatObjectMetadataMaps
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            updatedPredicate.objectMetadataUniversalIdentifier,
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
      isDefined(
        updatedPredicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
      ) &&
      flatRowLevelPermissionPredicateGroupMaps
    ) {
      const predicateGroup = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          updatedPredicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
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
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: updatedPredicate.roleUniversalIdentifier,
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

  private getInvalidValueError({
    fieldType,
    operand,
    subFieldName,
    value,
    workspaceMemberFieldMetadataUniversalIdentifier,
  }: {
    fieldType: FieldMetadataType;
    operand: RowLevelPermissionPredicateOperand;
    subFieldName: string | null | undefined;
    value: unknown;
    workspaceMemberFieldMetadataUniversalIdentifier: string | null | undefined;
  }) {
    if (isDefined(workspaceMemberFieldMetadataUniversalIdentifier)) {
      return undefined;
    }

    const recordFilterOperand = operand as unknown as ViewFilterOperand;

    if (
      isRecordFilterOperandExpectingValue(recordFilterOperand) &&
      !isNonEmptyString(convertViewFilterValueToString(value))
    ) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Operand "${operand}" requires a value, an empty predicate would remove the row restriction entirely`,
        userFriendlyMessage: msg`Predicate is missing a value`,
      };
    }

    const issue = getFilterValueValidationIssue({
      fieldType,
      operand: recordFilterOperand,
      subFieldName,
      value,
    });

    if (!isDefined(issue)) {
      return undefined;
    }

    const { stringifiedValue, filterType, hint } = issue;

    return {
      code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      message: isNonEmptyString(hint)
        ? t`Value "${stringifiedValue}" is not valid for operand "${operand}" on field type "${filterType}". ${hint}`
        : t`Value "${stringifiedValue}" is not valid for operand "${operand}" on field type "${filterType}".`,
      userFriendlyMessage: msg`Predicate value is not valid for this operand`,
    };
  }
}
