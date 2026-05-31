import {
  type CompositeFieldSubFieldName,
  type FilterableFieldType,
  ViewFilterOperand,
} from '@/types';

const emptyOperands = [
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
] as const;

// TODO: we would need to refactor the typing of SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS first
//   with types like FieldCurrencyValue being derived from a central constant value and not being created like that
//   in order to narrow down the possible subfield names for each field type
type CompositeFieldFilterOperandMap = {
  [K in FilterableFieldType]: Partial<{
    [S in CompositeFieldSubFieldName]: readonly ViewFilterOperand[];
  }>;
};

export const COMPOSITE_FIELD_FILTER_OPERANDS_MAP = {
  CURRENCY: {
    currencyCode: [
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT,
      ...emptyOperands,
    ],
    amountMicros: [
      ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      ViewFilterOperand.LESS_THAN_OR_EQUAL,
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT,
      ViewFilterOperand.IS_BETWEEN,
      ...emptyOperands,
    ],
  },
} as const satisfies Partial<CompositeFieldFilterOperandMap>;
