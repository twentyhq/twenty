import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { getInvalidViewFilterValueAndSelectOptionErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-value-and-select-option-errors.util';
import { getIncompatibleViewFilterOperandError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-incompatible-view-filter-operand-error.util';

export const validateFlatViewFilterUpdate = ({
  universalIdentifier,
  flatEntityUpdate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewFilterMaps: optimisticFlatViewFilterMaps,
    flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps,
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

    const incompatibleOperandError = getIncompatibleViewFilterOperandError({
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
      const isSelectOptionAffected =
        'value' in flatEntityUpdate ||
        'fieldMetadataUniversalIdentifier' in flatEntityUpdate ||
        'operand' in flatEntityUpdate;

      validationResult.errors.push(
        ...getInvalidViewFilterValueAndSelectOptionErrors({
          operand: updatedFlatViewFilter.operand,
          value: updatedFlatViewFilter.value,
          fieldType: referencedFieldMetadata.type,
          subFieldName: updatedFlatViewFilter.subFieldName,
          relationTargetFieldType,
          selectOptionFlatFieldMetadata: isSelectOptionAffected
            ? referencedFieldMetadata
            : undefined,
          flatFieldMetadataOptionMaps,
        }),
      );
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
