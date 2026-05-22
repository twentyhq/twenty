import {
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand,
} from '@/types';

const emptyOperands = [
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
] as const;

const relationOperands = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_NOT,
] as const;

type FilterOperandMap = {
  [K in FilterableAndTSVectorFieldType]: readonly ViewFilterOperand[];
};

export const FILTER_OPERANDS_MAP = {
  TEXT: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  EMAILS: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  FULL_NAME: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  ADDRESS: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  LINKS: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  PHONES: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  CURRENCY: [
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
    ...emptyOperands,
  ],
  NUMBER: [
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_NOT,
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
    ...emptyOperands,
  ],
  RAW_JSON: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  FILES: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  DATE_TIME: [
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_RELATIVE,
    ViewFilterOperand.IS_IN_PAST,
    ViewFilterOperand.IS_IN_FUTURE,
    ViewFilterOperand.IS_TODAY,
    ViewFilterOperand.IS_BEFORE,
    ViewFilterOperand.IS_AFTER,
    ...emptyOperands,
  ],
  DATE: [
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_RELATIVE,
    ViewFilterOperand.IS_IN_PAST,
    ViewFilterOperand.IS_IN_FUTURE,
    ViewFilterOperand.IS_TODAY,
    ViewFilterOperand.IS_BEFORE,
    ViewFilterOperand.IS_AFTER,
    ...emptyOperands,
  ],
  RATING: [
    ViewFilterOperand.IS,
    ViewFilterOperand.IS_NOT,
    ViewFilterOperand.GREATER_THAN_OR_EQUAL,
    ViewFilterOperand.LESS_THAN_OR_EQUAL,
    ...emptyOperands,
  ],
  RELATION: [...relationOperands, ...emptyOperands],
  MULTI_SELECT: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  SELECT: [ViewFilterOperand.IS, ViewFilterOperand.IS_NOT, ...emptyOperands],
  ACTOR: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  ARRAY: [
    ViewFilterOperand.CONTAINS,
    ViewFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  BOOLEAN: [ViewFilterOperand.IS],
  TS_VECTOR: [ViewFilterOperand.VECTOR_SEARCH],
  UUID: [ViewFilterOperand.IS, ViewFilterOperand.IS_NOT, ...emptyOperands],
} as const satisfies FilterOperandMap;
