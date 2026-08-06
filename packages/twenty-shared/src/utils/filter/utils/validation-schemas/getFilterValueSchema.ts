import { type z } from 'zod';

import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { isRecordFilterOperandExpectingValue } from '@/utils/filter/isRecordFilterOperandExpectingValue';
import {
  ACTOR_SUB_FIELD_VALUE_SCHEMAS,
  CURRENCY_CODE_VALUE_SCHEMAS,
  FILTER_VALUE_SCHEMAS_MAP,
} from '@/utils/filter/utils/validation-schemas/filterValueSchemasMap';

export const getFilterValueSchema = ({
  filterType,
  operand,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  operand: ViewFilterOperand;
  subFieldName?: string | null | undefined;
}): z.ZodType | undefined => {
  if (!isRecordFilterOperandExpectingValue(operand)) {
    return undefined;
  }

  if (filterType === 'CURRENCY' && subFieldName === 'currencyCode') {
    return CURRENCY_CODE_VALUE_SCHEMAS[
      operand as keyof typeof CURRENCY_CODE_VALUE_SCHEMAS
    ];
  }

  if (
    filterType === 'ACTOR' &&
    (subFieldName === 'source' || subFieldName === 'workspaceMemberId')
  ) {
    return ACTOR_SUB_FIELD_VALUE_SCHEMAS[subFieldName][
      operand as keyof (typeof ACTOR_SUB_FIELD_VALUE_SCHEMAS)[typeof subFieldName]
    ];
  }

  return (
    FILTER_VALUE_SCHEMAS_MAP[filterType] as Partial<
      Record<ViewFilterOperand, z.ZodType>
    >
  )[operand];
};
