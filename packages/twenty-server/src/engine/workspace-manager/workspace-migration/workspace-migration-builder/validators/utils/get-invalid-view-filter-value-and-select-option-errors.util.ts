import { FieldMetadataType, type ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadataOptionMapsForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getInvalidViewFilterSelectOptionError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-select-option-error.util';
import { getInvalidViewFilterValueError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-view-filter-value-error.util';

export const getInvalidViewFilterValueAndSelectOptionErrors = ({
  operand,
  value,
  fieldType,
  subFieldName,
  relationTargetFieldType,
  selectOptionFlatFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  operand: ViewFilterOperand;
  value: ViewFilterValue;
  fieldType: FieldMetadataType;
  subFieldName: string | null | undefined;
  relationTargetFieldType: FieldMetadataType | undefined;
  selectOptionFlatFieldMetadata: UniversalFlatFieldMetadata | undefined;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FlatEntityValidationError[] => {
  const invalidValueError = getInvalidViewFilterValueError({
    operand,
    fieldType,
    subFieldName,
    relationTargetFieldType,
    value,
  });

  if (
    !isDefined(selectOptionFlatFieldMetadata) ||
    (!isFieldMetadataEntityOfType(
      selectOptionFlatFieldMetadata,
      FieldMetadataType.SELECT,
    ) &&
      !isFieldMetadataEntityOfType(
        selectOptionFlatFieldMetadata,
        FieldMetadataType.MULTI_SELECT,
      ))
  ) {
    return [invalidValueError].filter(isDefined);
  }

  const invalidSelectOptionError = getInvalidViewFilterSelectOptionError({
    referencedFieldMetadata: selectOptionFlatFieldMetadata,
    flatFieldMetadataOptionMaps,
    operand,
    value,
  });

  return [invalidValueError, invalidSelectOptionError].filter(isDefined);
};
