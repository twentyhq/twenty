/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME, STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import {
  convertViewFilterValueToString,
  getFilterOperandsForFilterableFieldType,
  getFilterTypeFromFieldType,
  getFilterValueValidationIssue,
  isDefined,
  isMorphRelationHead,
  isNonEmptyArray,
  isRecordFilterOperandExpectingValue,
  isRecordFilterValueValid,
  isWorkspaceMemberFieldCompatibleWithRlsPredicate,
  jsonRelationFilterValueSchema,
  mapRLSOperandToRecordFilterOperand,
} from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { RowLevelPermissionPredicateExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import {
  FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { getRoleNotEditableErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-role-not-editable-errors.util';

const WORKSPACE_MEMBER_RELATION_FILTER_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.TEXT,
  FieldMetadataType.BOOLEAN,
];

@Injectable()
export class FlatRowLevelPermissionPredicateValidatorService {
  validateFlatRowLevelPermissionPredicateCreation({
    flatEntityToValidate: flatPredicateToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    buildOptions,
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
      validationResult.errors.push(
        ...this.getRelationHopErrors({
          fieldMetadata,
          objectMetadataUniversalIdentifier:
            flatPredicateToValidate.objectMetadataUniversalIdentifier,
          relationFieldMetadataUniversalIdentifier:
            flatPredicateToValidate.relationFieldMetadataUniversalIdentifier,
          flatFieldMetadataMaps,
        }),
      );

      const unsupportedOperandError = this.getUnsupportedOperandError({
        fieldType: fieldMetadata.type,
        operand: flatPredicateToValidate.operand,
        subFieldName: flatPredicateToValidate.subFieldName,
      });

      if (isDefined(unsupportedOperandError)) {
        validationResult.errors.push(unsupportedOperandError);
      }

      const oneToManyRelationError = this.getOneToManyRelationError({
        fieldMetadata,
        operand: flatPredicateToValidate.operand,
        relationFieldMetadataUniversalIdentifier:
          flatPredicateToValidate.relationFieldMetadataUniversalIdentifier,
      });

      if (isDefined(oneToManyRelationError)) {
        validationResult.errors.push(oneToManyRelationError);
      }

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

      const workspaceMemberRelationError = this.getWorkspaceMemberRelationError(
        {
          predicate: flatPredicateToValidate,
          flatFieldMetadataMaps,
        },
      );
      const workspaceMemberFieldError =
        workspaceMemberRelationError ??
        this.getWorkspaceMemberFieldError({
          fieldMetadata,
          operand: flatPredicateToValidate.operand,
          subFieldName: flatPredicateToValidate.subFieldName,
          workspaceMemberSubFieldName:
            flatPredicateToValidate.workspaceMemberSubFieldName,
          workspaceMemberFieldMetadata: this.findWorkspaceMemberFieldMetadata({
            workspaceMemberFieldMetadataUniversalIdentifier:
              flatPredicateToValidate.workspaceMemberFieldMetadataUniversalIdentifier,
            flatFieldMetadataMaps,
          }),
          workspaceMemberFieldMetadataUniversalIdentifier:
            flatPredicateToValidate.workspaceMemberFieldMetadataUniversalIdentifier,
          workspaceMemberFieldObjectUniversalIdentifier:
            this.findWorkspaceMemberFieldObjectUniversalIdentifier({
              predicate: flatPredicateToValidate,
              flatFieldMetadataMaps,
            }),
        });

      if (isDefined(workspaceMemberFieldError)) {
        validationResult.errors.push(workspaceMemberFieldError);
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
    } else {
      validationResult.errors.push(
        ...getRoleNotEditableErrors({ flatRole: role, buildOptions }),
      );
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
    buildOptions,
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

    if (isDefined(fieldMetadata)) {
      validationResult.errors.push(
        ...this.getRelationHopErrors({
          fieldMetadata,
          objectMetadataUniversalIdentifier:
            updatedPredicate.objectMetadataUniversalIdentifier,
          relationFieldMetadataUniversalIdentifier:
            updatedPredicate.relationFieldMetadataUniversalIdentifier,
          flatFieldMetadataMaps,
        }),
      );
    }

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
      'workspaceMemberFieldMetadataUniversalIdentifier' in flatEntityUpdate ||
      'workspaceMemberRelationFieldMetadataUniversalIdentifier' in
        flatEntityUpdate ||
      'workspaceMemberRelationFilterFieldMetadataUniversalIdentifier' in
        flatEntityUpdate ||
      'workspaceMemberRelationFilterValues' in flatEntityUpdate
    ) {
      const unsupportedOperandError = this.getUnsupportedOperandError({
        fieldType: fieldMetadata.type,
        operand: updatedPredicate.operand,
        subFieldName: updatedPredicate.subFieldName,
      });

      if (isDefined(unsupportedOperandError)) {
        validationResult.errors.push(unsupportedOperandError);
      }

      const oneToManyRelationError = this.getOneToManyRelationError({
        fieldMetadata,
        operand: updatedPredicate.operand,
        relationFieldMetadataUniversalIdentifier:
          updatedPredicate.relationFieldMetadataUniversalIdentifier,
      });

      if (isDefined(oneToManyRelationError)) {
        validationResult.errors.push(oneToManyRelationError);
      }

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

      const workspaceMemberFieldError =
        this.getWorkspaceMemberRelationError({
          predicate: updatedPredicate,
          flatFieldMetadataMaps,
        }) ??
        this.getWorkspaceMemberFieldError({
          fieldMetadata,
          operand: updatedPredicate.operand,
          subFieldName: updatedPredicate.subFieldName,
          workspaceMemberSubFieldName:
            updatedPredicate.workspaceMemberSubFieldName,
          workspaceMemberFieldMetadata: this.findWorkspaceMemberFieldMetadata({
            workspaceMemberFieldMetadataUniversalIdentifier:
              updatedPredicate.workspaceMemberFieldMetadataUniversalIdentifier,
            flatFieldMetadataMaps,
          }),
          workspaceMemberFieldMetadataUniversalIdentifier:
            updatedPredicate.workspaceMemberFieldMetadataUniversalIdentifier,
          workspaceMemberFieldObjectUniversalIdentifier:
            this.findWorkspaceMemberFieldObjectUniversalIdentifier({
              predicate: updatedPredicate,
              flatFieldMetadataMaps,
            }),
        });

      if (isDefined(workspaceMemberFieldError)) {
        validationResult.errors.push(workspaceMemberFieldError);
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
    } else {
      validationResult.errors.push(
        ...getRoleNotEditableErrors({ flatRole: role, buildOptions }),
      );
    }

    return validationResult;
  }

  // A row level permission predicate compiles without a current record, so a
  // relation value resolving only through isCurrentRecordSelected yields no
  // record id and removes the restriction instead of matching nothing. View
  // filters do resolve it, so this cannot live in the shared schema.
  private getUnresolvableRelationError({
    fieldType,
    operand,
    value,
  }: {
    fieldType: FieldMetadataType;
    operand: RowLevelPermissionPredicateOperand;
    value: unknown;
  }) {
    if (getFilterTypeFromFieldType(fieldType) !== 'RELATION') {
      return undefined;
    }

    const stringifiedValue = convertViewFilterValueToString(value);

    const relationValue =
      jsonRelationFilterValueSchema.safeParse(stringifiedValue);

    if (
      !relationValue.success ||
      relationValue.data.selectedRecordIds.length > 0 ||
      relationValue.data.isCurrentWorkspaceMemberSelected === true
    ) {
      return undefined;
    }

    return {
      code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      message: t`Value "${stringifiedValue}" resolves to no record for operand "${operand}", the current record is not available to a row level permission predicate`,
      userFriendlyMessage: msg`Predicate value is not valid for this operand`,
    };
  }

  private getRelationHopErrors({
    fieldMetadata,
    objectMetadataUniversalIdentifier,
    relationFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  }: {
    fieldMetadata: UniversalFlatFieldMetadata;
    objectMetadataUniversalIdentifier: string;
    relationFieldMetadataUniversalIdentifier: string | null;
    flatFieldMetadataMaps:
      | UniversalFlatEntityMaps<UniversalFlatFieldMetadata>
      | undefined;
  }): FlatEntityValidationError[] {
    if (
      !isDefined(relationFieldMetadataUniversalIdentifier) ||
      !isDefined(flatFieldMetadataMaps)
    ) {
      return [];
    }

    const relationFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: relationFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(relationFieldMetadata)) {
      return [
        {
          code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
          message: t`Relation field metadata not found`,
          userFriendlyMessage: msg`Relation field metadata not found`,
        },
      ];
    }

    const relationFieldName = relationFieldMetadata.name;

    if (
      relationFieldMetadata.objectMetadataUniversalIdentifier !==
      objectMetadataUniversalIdentifier
    ) {
      return [
        {
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`Relation field "${relationFieldName}" does not belong to the object the predicate restricts`,
          userFriendlyMessage: msg`This relation field does not belong to the restricted object`,
        },
      ];
    }

    if (
      !isMorphOrRelationUniversalFlatFieldMetadata(relationFieldMetadata) ||
      isMorphRelationHead(relationFieldMetadata) ||
      !isDefined(
        relationFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
      )
    ) {
      return [
        {
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`Field "${relationFieldName}" is not a relation`,
          userFriendlyMessage: msg`The predicate can only go through a relation field`,
        },
      ];
    }

    if (!relationFieldMetadata.isActive) {
      return [
        {
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`Relation field "${relationFieldName}" is not active`,
          userFriendlyMessage: msg`The predicate can only go through an active relation field`,
        },
      ];
    }

    if (
      fieldMetadata.objectMetadataUniversalIdentifier !==
      relationFieldMetadata.relationTargetObjectMetadataUniversalIdentifier
    ) {
      const fieldName = fieldMetadata.name;

      return [
        {
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`Field "${fieldName}" does not belong to the object reached by relation "${relationFieldName}"`,
          userFriendlyMessage: msg`This field does not belong to the object reached by the relation`,
        },
      ];
    }

    return [];
  }

  private findWorkspaceMemberFieldMetadata({
    workspaceMemberFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  }: {
    workspaceMemberFieldMetadataUniversalIdentifier: string | null | undefined;
    flatFieldMetadataMaps:
      | UniversalFlatEntityMaps<UniversalFlatFieldMetadata>
      | undefined;
  }): UniversalFlatFieldMetadata | undefined {
    if (
      !isDefined(workspaceMemberFieldMetadataUniversalIdentifier) ||
      !isDefined(flatFieldMetadataMaps)
    ) {
      return undefined;
    }

    return findFlatEntityByUniversalIdentifier({
      universalIdentifier: workspaceMemberFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });
  }

  private isOwningRelationFlatFieldMetadata(
    flatFieldMetadata: UniversalFlatFieldMetadata,
  ): boolean {
    return (
      flatFieldMetadata.type === FieldMetadataType.RELATION &&
      isMorphOrRelationUniversalFlatFieldMetadata(flatFieldMetadata) &&
      flatFieldMetadata.universalSettings?.relationType ===
        RelationType.MANY_TO_ONE
    );
  }

  private findWorkspaceMemberFieldObjectUniversalIdentifier({
    predicate,
    flatFieldMetadataMaps,
  }: {
    predicate: Pick<
      UniversalFlatRowLevelPermissionPredicate,
      'workspaceMemberRelationFieldMetadataUniversalIdentifier'
    >;
    flatFieldMetadataMaps:
      | UniversalFlatEntityMaps<UniversalFlatFieldMetadata>
      | undefined;
  }): string | null | undefined {
    if (
      !isDefined(
        predicate.workspaceMemberRelationFieldMetadataUniversalIdentifier,
      )
    ) {
      return STANDARD_OBJECTS.workspaceMember.universalIdentifier;
    }

    return this.findWorkspaceMemberFieldMetadata({
      workspaceMemberFieldMetadataUniversalIdentifier:
        predicate.workspaceMemberRelationFieldMetadataUniversalIdentifier,
      flatFieldMetadataMaps,
    })?.relationTargetObjectMetadataUniversalIdentifier;
  }

  private getWorkspaceMemberRelationError({
    predicate,
    flatFieldMetadataMaps,
  }: {
    predicate: Pick<
      UniversalFlatRowLevelPermissionPredicate,
      | 'workspaceMemberFieldMetadataUniversalIdentifier'
      | 'workspaceMemberRelationFieldMetadataUniversalIdentifier'
      | 'workspaceMemberRelationFilterFieldMetadataUniversalIdentifier'
      | 'workspaceMemberRelationFilterValues'
    >;
    flatFieldMetadataMaps:
      | UniversalFlatEntityMaps<UniversalFlatFieldMetadata>
      | undefined;
  }): FlatEntityValidationError | undefined {
    const {
      workspaceMemberFieldMetadataUniversalIdentifier,
      workspaceMemberRelationFieldMetadataUniversalIdentifier,
      workspaceMemberRelationFilterFieldMetadataUniversalIdentifier,
      workspaceMemberRelationFilterValues,
    } = predicate;

    if (!isDefined(workspaceMemberRelationFieldMetadataUniversalIdentifier)) {
      if (
        isDefined(
          workspaceMemberRelationFilterFieldMetadataUniversalIdentifier,
        ) ||
        isDefined(workspaceMemberRelationFilterValues)
      ) {
        return {
          code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
          message: t`A workspace member relation filter needs a workspace member relation`,
          userFriendlyMessage: msg`Choose the relation of the workspace member to filter`,
        };
      }

      return undefined;
    }

    const workspaceMemberRelationFieldMetadata =
      this.findWorkspaceMemberFieldMetadata({
        workspaceMemberFieldMetadataUniversalIdentifier:
          workspaceMemberRelationFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

    if (!isDefined(workspaceMemberRelationFieldMetadata)) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Workspace member relation field metadata not found`,
        userFriendlyMessage: msg`Workspace member relation field metadata not found`,
      };
    }

    if (
      workspaceMemberRelationFieldMetadata.objectMetadataUniversalIdentifier !==
        STANDARD_OBJECTS.workspaceMember.universalIdentifier ||
      workspaceMemberRelationFieldMetadata.type !==
        FieldMetadataType.RELATION ||
      !isMorphOrRelationUniversalFlatFieldMetadata(
        workspaceMemberRelationFieldMetadata,
      ) ||
      workspaceMemberRelationFieldMetadata.universalSettings?.relationType !==
        RelationType.ONE_TO_MANY ||
      !isDefined(
        workspaceMemberRelationFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
      )
    ) {
      const workspaceMemberRelationFieldName =
        workspaceMemberRelationFieldMetadata.name;

      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Field "${workspaceMemberRelationFieldName}" is not a one-to-many relation of the workspaceMember object`,
        userFriendlyMessage: msg`This field is not a one-to-many relation of the workspace member object`,
      };
    }

    if (!isDefined(workspaceMemberFieldMetadataUniversalIdentifier)) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`A workspace member relation needs the field to read on its related records`,
        userFriendlyMessage: msg`Choose the field to read on the related records`,
      };
    }

    return this.getWorkspaceMemberRelationFilterError({
      workspaceMemberRelationFilterFieldMetadataUniversalIdentifier,
      workspaceMemberRelationFilterValues,
      relatedObjectMetadataUniversalIdentifier:
        workspaceMemberRelationFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
      flatFieldMetadataMaps,
    });
  }

  private getWorkspaceMemberRelationFilterError({
    workspaceMemberRelationFilterFieldMetadataUniversalIdentifier,
    workspaceMemberRelationFilterValues,
    relatedObjectMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  }: {
    workspaceMemberRelationFilterFieldMetadataUniversalIdentifier:
      | string
      | null
      | undefined;
    workspaceMemberRelationFilterValues: string[] | null | undefined;
    relatedObjectMetadataUniversalIdentifier: string;
    flatFieldMetadataMaps:
      | UniversalFlatEntityMaps<UniversalFlatFieldMetadata>
      | undefined;
  }): FlatEntityValidationError | undefined {
    if (
      !isDefined(
        workspaceMemberRelationFilterFieldMetadataUniversalIdentifier,
      ) &&
      !isDefined(workspaceMemberRelationFilterValues)
    ) {
      return undefined;
    }

    if (
      !isDefined(
        workspaceMemberRelationFilterFieldMetadataUniversalIdentifier,
      ) ||
      !isNonEmptyArray(workspaceMemberRelationFilterValues) ||
      !workspaceMemberRelationFilterValues.every(isNonEmptyString)
    ) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`A workspace member relation filter needs a field and at least one value`,
        userFriendlyMessage: msg`Choose the field and the values to keep on the related records`,
      };
    }

    const workspaceMemberRelationFilterFieldMetadata =
      this.findWorkspaceMemberFieldMetadata({
        workspaceMemberFieldMetadataUniversalIdentifier:
          workspaceMemberRelationFilterFieldMetadataUniversalIdentifier,
        flatFieldMetadataMaps,
      });

    if (!isDefined(workspaceMemberRelationFilterFieldMetadata)) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Workspace member relation filter field metadata not found`,
        userFriendlyMessage: msg`Workspace member relation filter field metadata not found`,
      };
    }

    if (
      workspaceMemberRelationFilterFieldMetadata.objectMetadataUniversalIdentifier !==
        relatedObjectMetadataUniversalIdentifier ||
      !WORKSPACE_MEMBER_RELATION_FILTER_FIELD_TYPES.includes(
        workspaceMemberRelationFilterFieldMetadata.type,
      )
    ) {
      const workspaceMemberRelationFilterFieldName =
        workspaceMemberRelationFilterFieldMetadata.name;

      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Field "${workspaceMemberRelationFilterFieldName}" is not a select, text or boolean field of the related records`,
        userFriendlyMessage: msg`Filter the related records on one of their select, text or boolean fields`,
      };
    }

    return undefined;
  }

  private getWorkspaceMemberFieldError({
    fieldMetadata,
    operand,
    subFieldName,
    workspaceMemberFieldMetadata,
    workspaceMemberFieldMetadataUniversalIdentifier,
    workspaceMemberSubFieldName,
    workspaceMemberFieldObjectUniversalIdentifier,
  }: {
    fieldMetadata: UniversalFlatFieldMetadata;
    operand: RowLevelPermissionPredicateOperand;
    subFieldName: string | null | undefined;
    workspaceMemberSubFieldName: string | null | undefined;
    workspaceMemberFieldMetadata: UniversalFlatFieldMetadata | undefined;
    workspaceMemberFieldMetadataUniversalIdentifier: string | null | undefined;
    workspaceMemberFieldObjectUniversalIdentifier: string | null | undefined;
  }) {
    if (!isDefined(workspaceMemberFieldMetadataUniversalIdentifier)) {
      return undefined;
    }

    if (!isDefined(workspaceMemberFieldMetadata)) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: t`Workspace member field metadata not found`,
        userFriendlyMessage: msg`Workspace member field metadata not found`,
      };
    }

    if (
      workspaceMemberFieldMetadata.objectMetadataUniversalIdentifier !==
      workspaceMemberFieldObjectUniversalIdentifier
    ) {
      const workspaceMemberFieldName = workspaceMemberFieldMetadata.name;

      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Field "${workspaceMemberFieldName}" is not a field of the workspaceMember object, the predicate would never apply`,
        userFriendlyMessage: msg`This field does not belong to the workspace member object`,
      };
    }

    const recordFilterOperand = mapRLSOperandToRecordFilterOperand(operand);

    if (
      isRecordFilterOperandExpectingValue(recordFilterOperand) &&
      !isWorkspaceMemberFieldCompatibleWithRlsPredicate({
        fieldType: fieldMetadata.type,
        subFieldName,
        workspaceMemberFieldType: workspaceMemberFieldMetadata.type,
        workspaceMemberSubFieldName,
      })
    ) {
      const fieldName = fieldMetadata.name;
      const workspaceMemberFieldName = workspaceMemberFieldMetadata.name;

      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Field "${fieldName}" cannot be compared to workspace member field "${workspaceMemberFieldName}", their types are not compatible`,
        userFriendlyMessage: msg`This field cannot be compared to this workspace member field`,
      };
    }

    const isRecordFieldFilteredAsRelation =
      getFilterTypeFromFieldType(fieldMetadata.type) === 'RELATION';

    if (
      isRecordFieldFilteredAsRelation &&
      operand !== RowLevelPermissionPredicateOperand.IS &&
      operand !== RowLevelPermissionPredicateOperand.IS_NOT
    ) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Operand "${operand}" is not supported on a relation field, use IS or IS_NOT`,
        userFriendlyMessage: msg`This operand is not supported on a relation field`,
      };
    }

    if (
      isRecordFieldFilteredAsRelation &&
      !this.isOwningRelationFlatFieldMetadata(fieldMetadata)
    ) {
      const fieldName = fieldMetadata.name;

      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Field "${fieldName}" is not a many-to-one relation, it has no join column to compare against`,
        userFriendlyMessage: msg`This relation field cannot be used in a record rule`,
      };
    }

    if (
      !isMorphOrRelationUniversalFlatFieldMetadata(workspaceMemberFieldMetadata)
    ) {
      return undefined;
    }

    if (!this.isOwningRelationFlatFieldMetadata(workspaceMemberFieldMetadata)) {
      const workspaceMemberFieldName = workspaceMemberFieldMetadata.name;

      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Workspace member field "${workspaceMemberFieldName}" is not a many-to-one relation, its value cannot be resolved for the current user`,
        userFriendlyMessage: msg`This workspace member field cannot be compared`,
      };
    }

    const isRecordIdOfWorkspaceMemberFieldTarget =
      fieldMetadata.type === FieldMetadataType.UUID &&
      fieldMetadata.name === 'id' &&
      fieldMetadata.objectMetadataUniversalIdentifier ===
        workspaceMemberFieldMetadata.relationTargetObjectMetadataUniversalIdentifier;

    if (isRecordIdOfWorkspaceMemberFieldTarget) {
      return undefined;
    }

    if (
      fieldMetadata.type !== FieldMetadataType.RELATION ||
      !isDefined(
        workspaceMemberFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
      ) ||
      workspaceMemberFieldMetadata.relationTargetObjectMetadataUniversalIdentifier !==
        fieldMetadata.relationTargetObjectMetadataUniversalIdentifier
    ) {
      const workspaceMemberFieldName = workspaceMemberFieldMetadata.name;
      const fieldName = fieldMetadata.name;

      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Fields "${fieldName}" and "${workspaceMemberFieldName}" must be relations pointing to the same object to be compared`,
        userFriendlyMessage: msg`These two relation fields do not point to the same object`,
      };
    }

    return undefined;
  }

  private getOneToManyRelationError({
    fieldMetadata,
    operand,
    relationFieldMetadataUniversalIdentifier,
  }: {
    fieldMetadata: UniversalFlatFieldMetadata;
    operand: RowLevelPermissionPredicateOperand;
    relationFieldMetadataUniversalIdentifier: string | null;
  }) {
    if (
      isDefined(relationFieldMetadataUniversalIdentifier) ||
      !isMorphOrRelationUniversalFlatFieldMetadata(fieldMetadata) ||
      fieldMetadata.universalSettings?.relationType !== RelationType.ONE_TO_MANY
    ) {
      return undefined;
    }

    if (fieldMetadata.type === FieldMetadataType.MORPH_RELATION) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`A one-to-many morph relation cannot be compared directly, go through the relation to compare a field of its records`,
        userFriendlyMessage: msg`This operand is not supported for this relation`,
      };
    }

    if (
      operand !== RowLevelPermissionPredicateOperand.IS_EMPTY &&
      operand !== RowLevelPermissionPredicateOperand.IS_NOT_EMPTY
    ) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`A one-to-many relation only supports the IS_EMPTY and IS_NOT_EMPTY operands, go through the relation to compare a field of its records`,
        userFriendlyMessage: msg`This operand is not supported for this relation`,
      };
    }

    return undefined;
  }

  private getUnsupportedOperandError({
    fieldType,
    operand,
    subFieldName,
  }: {
    fieldType: FieldMetadataType;
    operand: RowLevelPermissionPredicateOperand;
    subFieldName: string | null | undefined;
  }) {
    const filterType = getFilterTypeFromFieldType(fieldType);

    const allowedOperands = getFilterOperandsForFilterableFieldType({
      filterType,
      subFieldName,
    });

    if (allowedOperands.includes(mapRLSOperandToRecordFilterOperand(operand))) {
      return undefined;
    }

    return {
      code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
      message: t`Operand ${operand} is not supported for field type ${filterType}`,
      userFriendlyMessage: msg`This operand is not supported for this field`,
    };
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

    const recordFilterOperand = mapRLSOperandToRecordFilterOperand(operand);

    if (
      isRecordFilterOperandExpectingValue(recordFilterOperand) &&
      !isRecordFilterValueValid({
        operand: recordFilterOperand,
        value: convertViewFilterValueToString(value),
      })
    ) {
      return {
        code: RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
        message: t`Operand "${operand}" requires a value, an empty predicate would remove the row restriction entirely`,
        userFriendlyMessage: msg`Predicate is missing a value`,
      };
    }

    const unresolvableRelationError = this.getUnresolvableRelationError({
      fieldType,
      operand,
      value,
    });

    if (isDefined(unresolvableRelationError)) {
      return unresolvableRelationError;
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
