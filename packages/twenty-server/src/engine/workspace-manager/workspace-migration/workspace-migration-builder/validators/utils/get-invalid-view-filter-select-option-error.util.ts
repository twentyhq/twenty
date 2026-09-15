import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType, type ViewFilterOperand } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getInvalidSelectFilterOptionValues } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-invalid-select-filter-option-values.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

export const getInvalidViewFilterSelectOptionError = ({
  referencedFieldMetadata,
  operand,
  value,
}: {
  referencedFieldMetadata: Pick<
    FlatFieldMetadata<
      FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT
    >,
    'type' | 'options' | 'label'
  >;
  operand: ViewFilterOperand;
  value: ViewFilterValue;
}) => {
  const invalidValues = getInvalidSelectFilterOptionValues({
    fieldMetadata: referencedFieldMetadata,
    operand,
    value,
  });

  if (invalidValues.length === 0) {
    return undefined;
  }

  const invalidValuesText = invalidValues.join(', ');
  const allowedValuesText = referencedFieldMetadata.options
    ?.map((option) => option.value)
    .join(', ');

  return {
    code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
    message: t`Filter on "${referencedFieldMetadata.label}" uses option(s) ${invalidValuesText} that do not exist. Allowed values: ${allowedValuesText}.`,
    userFriendlyMessage: msg`Filter uses a select option that does not exist`,
  };
};
