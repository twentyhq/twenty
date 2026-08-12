import { msg, t } from '@lingui/core/macro';
import { FieldMetadataType, type ViewFilterOperand } from 'twenty-shared/types';
import {
  getFilterOperandsForFilterableFieldType,
  getFilterTypeFromFieldType,
} from 'twenty-shared/utils';

import { getEffectiveFilterFieldType } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-effective-filter-field-type.util';
import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';

export const getIncompatibleViewFilterOperandError = ({
  operand,
  fieldType,
  subFieldName,
  relationTargetFieldType,
}: {
  operand: ViewFilterOperand;
  fieldType: FieldMetadataType;
  subFieldName: string | null | undefined;
  relationTargetFieldType: FieldMetadataType | undefined;
}) => {
  const effectiveFieldType = getEffectiveFilterFieldType({
    fieldType,
    relationTargetFieldType,
  });

  const filterType = getFilterTypeFromFieldType(effectiveFieldType);

  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType,
    subFieldName,
  });

  if (allowedOperands.includes(operand)) {
    return undefined;
  }

  return {
    code: ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
    message: t`Operand "${operand}" is not supported on field type "${filterType}". Supported operands: ${allowedOperands.join(', ')}.`,
    userFriendlyMessage: msg`Filter operand is not supported for this field type`,
  };
};
