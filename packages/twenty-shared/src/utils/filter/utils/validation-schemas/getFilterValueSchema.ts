import { type z } from 'zod';

import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand,
} from '@/types';
import { isRecordFilterOperandExpectingValue } from '@/utils/filter/isRecordFilterOperandExpectingValue';
import { isDefined } from '@/utils/validation/isDefined';
import {
  COMPOSITE_SUB_FIELD_VALUE_SCHEMAS,
  FILTER_VALUE_SCHEMAS_MAP,
} from '@/utils/filter/utils/validation-schemas/filterValueSchemasMap';

type OperandSchemas = Partial<Record<ViewFilterOperand, z.ZodType>>;

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

  const subFieldSchemas: Record<string, OperandSchemas> | undefined =
    COMPOSITE_SUB_FIELD_VALUE_SCHEMAS[
      filterType as keyof typeof COMPOSITE_SUB_FIELD_VALUE_SCHEMAS
    ];

  // A recognized composite sub field owns its whole operand set: falling back to
  // the parent contract would accept operands the reader rejects for it.
  if (isDefined(subFieldName) && isDefined(subFieldSchemas?.[subFieldName])) {
    return subFieldSchemas[subFieldName][operand];
  }

  return (FILTER_VALUE_SCHEMAS_MAP[filterType] as OperandSchemas)[operand];
};
