import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { getInvalidSelectOptionError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-select-option-error.util';
import { getInvalidValueError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-value-error.util';
import { getIncompatibleOperandError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-incompatible-operand-error.util';

export const validateFlatViewFilterUpdate = ({
  universalIdentifier,
  flatEntityUpdate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewFilterMaps: optimisticFlatViewFilterMaps,
    flatFieldMetadataMaps,
    flatViewFilterGroupMaps,
  },
}: FlatEntityUpdateValidationArgs<
  typeof ALL_METADATA_NAME.viewFilter
>): FailedFlatEntityValidation<'viewFilter', 'update'> => {
  const existingViewFilter = findFlatEntityByUniversalIdentifier({
    universalIdentifier,
    flatEntityMaps: optimisticFlatViewFilterMaps,
  });

  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier,
    },
    metadataName: 'viewFilter',
    type: 'update',
  });

  if (!isDefined(existingViewFilter)) {
    validationResult.errors.push({
      code: ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      message: t`View filter not found`,
      userFriendlyMessage: msg`View filter not found`,
    });

    return validationResult;
  }

  const updatedFlatViewFilter = {
    ...existingViewFilter,
    ...flatEntityUpdate,
  };

  const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: updatedFlatViewFilter.fieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(referencedFieldMetadata)) {
    validationResult.errors.push({
      code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
      message: t`Field metadata not found`,
      userFriendlyMessage: msg`Field metadata not found`,
    });
  } else {
    let relationTargetFieldType: FieldMetadataType | undefined;

    if (
      isDefined(
        updatedFlatViewFilter.relationTargetFieldMetadataUniversalIdentifier,
      )
    ) {
      const relationTargetFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          updatedFlatViewFilter.relationTargetFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      relationTargetFieldType = relationTargetFieldMetadata?.type;
    }

    const incompatibleOperandError = getIncompatibleOperandError({
      operand: updatedFlatViewFilter.operand,
      fieldType: referencedFieldMetadata.type,
      subFieldName: updatedFlatViewFilter.subFieldName,
      relationTargetFieldType,
    });

    if (isDefined(incompatibleOperandError)) {
      validationResult.errors.push(incompatibleOperandError);
    }

    if (
      'value' in flatEntityUpdate ||
      'fieldMetadataUniversalIdentifier' in flatEntityUpdate ||
      'operand' in flatEntityUpdate ||
      'subFieldName' in flatEntityUpdate ||
      'relationTargetFieldMetadataUniversalIdentifier' in flatEntityUpdate
    ) {
      const invalidValueError = getInvalidValueError({
        operand: updatedFlatViewFilter.operand,
        fieldType: referencedFieldMetadata.type,
        subFieldName: updatedFlatViewFilter.subFieldName,
        relationTargetFieldType,
        value: updatedFlatViewFilter.value,
      });

      if (isDefined(invalidValueError)) {
        validationResult.errors.push(invalidValueError);
      }
    }

    if (
      ('value' in flatEntityUpdate ||
        'fieldMetadataUniversalIdentifier' in flatEntityUpdate ||
        'operand' in flatEntityUpdate) &&
      (isFieldMetadataEntityOfType(
        referencedFieldMetadata,
        FieldMetadataType.SELECT,
      ) ||
        isFieldMetadataEntityOfType(
          referencedFieldMetadata,
          FieldMetadataType.MULTI_SELECT,
        ))
    ) {
      const invalidSelectOptionError = getInvalidSelectOptionError({
        referencedFieldMetadata,
        operand: updatedFlatViewFilter.operand,
        value: updatedFlatViewFilter.value,
      });

      if (isDefined(invalidSelectOptionError)) {
        validationResult.errors.push(invalidSelectOptionError);
      }
    }
  }

  if (isDefined(updatedFlatViewFilter.viewFilterGroupUniversalIdentifier)) {
    const referencedViewFilterGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        updatedFlatViewFilter.viewFilterGroupUniversalIdentifier,
      flatEntityMaps: flatViewFilterGroupMaps,
    });

    if (!isDefined(referencedViewFilterGroup)) {
      validationResult.errors.push({
        code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        message: t`View filter group not found`,
        userFriendlyMessage: msg`View filter group not found`,
      });
    }
  }

  return validationResult;
};
