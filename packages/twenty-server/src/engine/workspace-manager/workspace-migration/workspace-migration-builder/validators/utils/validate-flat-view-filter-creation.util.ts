import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { getInvalidViewFilterSelectOptionError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-select-option-error.util';
import { getInvalidViewFilterValueError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-value-error.util';
import { getIncompatibleViewFilterOperandError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-incompatible-view-filter-operand-error.util';

export const validateFlatViewFilterCreation = ({
  flatEntityToValidate: flatViewFilterToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatViewFilterMaps: optimisticFlatViewFilterMaps,
    flatViewMaps,
    flatFieldMetadataMaps,
    flatViewFilterGroupMaps,
  },
}: UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.viewFilter
>): FailedFlatEntityValidation<'viewFilter', 'create'> => {
  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier: flatViewFilterToValidate.universalIdentifier,
    },
    metadataName: 'viewFilter',
    type: 'create',
  });

  const existingViewFilter = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatViewFilterToValidate.universalIdentifier,
    flatEntityMaps: optimisticFlatViewFilterMaps,
  });

  if (isDefined(existingViewFilter)) {
    validationResult.errors.push({
      code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
      message: t`View filter with this universal identifier already exists`,
      userFriendlyMessage: msg`View filter already exists`,
    });
  }

  const referencedView = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatViewFilterToValidate.viewUniversalIdentifier,
    flatEntityMaps: flatViewMaps,
  });

  if (!isDefined(referencedView)) {
    validationResult.errors.push({
      code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
      message: t`View not found`,
      userFriendlyMessage: msg`View not found`,
    });
  }

  const referencedFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier:
      flatViewFilterToValidate.fieldMetadataUniversalIdentifier,
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
        flatViewFilterToValidate.relationTargetFieldMetadataUniversalIdentifier,
      )
    ) {
      const relationTargetFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier:
          flatViewFilterToValidate.relationTargetFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      relationTargetFieldType = relationTargetFieldMetadata?.type;
    }

    const incompatibleOperandError = getIncompatibleViewFilterOperandError({
      operand: flatViewFilterToValidate.operand,
      fieldType: referencedFieldMetadata.type,
      subFieldName: flatViewFilterToValidate.subFieldName,
      relationTargetFieldType,
    });

    if (isDefined(incompatibleOperandError)) {
      validationResult.errors.push(incompatibleOperandError);
    }

    const invalidValueError = getInvalidViewFilterValueError({
      operand: flatViewFilterToValidate.operand,
      fieldType: referencedFieldMetadata.type,
      subFieldName: flatViewFilterToValidate.subFieldName,
      relationTargetFieldType,
      value: flatViewFilterToValidate.value,
    });

    if (isDefined(invalidValueError)) {
      validationResult.errors.push(invalidValueError);
    }

    if (
      isFieldMetadataEntityOfType(
        referencedFieldMetadata,
        FieldMetadataType.SELECT,
      ) ||
      isFieldMetadataEntityOfType(
        referencedFieldMetadata,
        FieldMetadataType.MULTI_SELECT,
      )
    ) {
      const invalidSelectOptionError = getInvalidViewFilterSelectOptionError({
        referencedFieldMetadata,
        operand: flatViewFilterToValidate.operand,
        value: flatViewFilterToValidate.value,
      });

      if (isDefined(invalidSelectOptionError)) {
        validationResult.errors.push(invalidSelectOptionError);
      }
    }
  }

  if (isDefined(flatViewFilterToValidate.viewFilterGroupUniversalIdentifier)) {
    const referencedViewFilterGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        flatViewFilterToValidate.viewFilterGroupUniversalIdentifier,
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
