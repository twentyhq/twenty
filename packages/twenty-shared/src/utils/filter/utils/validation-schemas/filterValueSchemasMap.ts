import { type z } from 'zod';

import { ViewFilterOperand } from '@/types';
import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { arrayOfStringsOrVariablesSchema } from '@/utils/filter/utils/validation-schemas/arrayOfStringsOrVariablesSchema';
import { strictArrayOfUuidOrVariableSchema } from '@/utils/filter/utils/validation-schemas/arrayOfUuidsOrVariablesSchema';
import {
  actorSourceFilterValueSchema,
  booleanFilterValueSchema,
  instantFilterValueSchema,
  nonEmptyStringFilterValueSchema,
  numericFilterValueSchema,
  plainDateFilterValueSchema,
  plainDateOrInstantFilterValueSchema,
} from '@/utils/filter/utils/validation-schemas/filterValueScalarSchemas';
import { jsonRelationFilterValueSchema } from '@/utils/filter/utils/validation-schemas/jsonRelationFilterValueSchema';
import { type FILTER_OPERANDS_MAP } from '@/utils/filter/utils/filterOperandsMap';

type ValuelessOperand =
  | ViewFilterOperand.IS_NOT_NULL
  | ViewFilterOperand.IS_EMPTY
  | ViewFilterOperand.IS_NOT_EMPTY
  | ViewFilterOperand.IS_IN_PAST
  | ViewFilterOperand.IS_IN_FUTURE
  | ViewFilterOperand.IS_TODAY;

type FilterValueSchemasMap = {
  [FilterType in keyof typeof FILTER_OPERANDS_MAP]: Record<
    Exclude<(typeof FILTER_OPERANDS_MAP)[FilterType][number], ValuelessOperand>,
    z.ZodType
  > &
    Partial<Record<ViewFilterOperand, z.ZodType>>;
};

const relationFilterValueSchema = jsonRelationFilterValueSchema
  .refine(
    ({ selectedRecordIds }) =>
      strictArrayOfUuidOrVariableSchema.safeParse(selectedRecordIds).success,
    'Expected selectedRecordIds to contain UUIDs or variables',
  )
  .or(strictArrayOfUuidOrVariableSchema);

const selectFilterValueSchema = nonEmptyStringFilterValueSchema.refine(
  (value) => {
    if (arrayOfStringsOrVariablesSchema.safeParse(value).success) {
      return true;
    }

    try {
      JSON.parse(value);
    } catch {
      return true;
    }

    return false;
  },
  'Expected an array of option values',
);

const containsOperandsSchemas = {
  [ViewFilterOperand.CONTAINS]: nonEmptyStringFilterValueSchema,
  [ViewFilterOperand.DOES_NOT_CONTAIN]: nonEmptyStringFilterValueSchema,
};

const numericOperandsSchemas = {
  [ViewFilterOperand.IS]: numericFilterValueSchema,
  [ViewFilterOperand.IS_NOT]: numericFilterValueSchema,
  [ViewFilterOperand.GREATER_THAN_OR_EQUAL]: numericFilterValueSchema,
  [ViewFilterOperand.LESS_THAN_OR_EQUAL]: numericFilterValueSchema,
};

export const FILTER_VALUE_SCHEMAS_MAP = {
  TEXT: containsOperandsSchemas,
  EMAILS: containsOperandsSchemas,
  FULL_NAME: containsOperandsSchemas,
  ADDRESS: containsOperandsSchemas,
  LINKS: containsOperandsSchemas,
  PHONES: containsOperandsSchemas,
  RAW_JSON: containsOperandsSchemas,
  FILES: containsOperandsSchemas,
  ARRAY: containsOperandsSchemas,
  ACTOR: containsOperandsSchemas,
  MULTI_SELECT: {
    [ViewFilterOperand.CONTAINS]: selectFilterValueSchema,
    [ViewFilterOperand.DOES_NOT_CONTAIN]: selectFilterValueSchema,
  },
  SELECT: {
    [ViewFilterOperand.IS]: selectFilterValueSchema,
    [ViewFilterOperand.IS_NOT]: selectFilterValueSchema,
  },
  CURRENCY: numericOperandsSchemas,
  NUMBER: numericOperandsSchemas,
  RATING: numericOperandsSchemas,
  DATE: {
    [ViewFilterOperand.IS]: plainDateFilterValueSchema,
    [ViewFilterOperand.IS_BEFORE]: plainDateFilterValueSchema,
    [ViewFilterOperand.IS_AFTER]: plainDateFilterValueSchema,
    [ViewFilterOperand.IS_RELATIVE]: relativeDateFilterStringifiedSchema,
  },
  DATE_TIME: {
    [ViewFilterOperand.IS]: plainDateOrInstantFilterValueSchema,
    [ViewFilterOperand.IS_BEFORE]: instantFilterValueSchema,
    [ViewFilterOperand.IS_AFTER]: instantFilterValueSchema,
    [ViewFilterOperand.IS_RELATIVE]: relativeDateFilterStringifiedSchema,
  },
  RELATION: {
    [ViewFilterOperand.IS]: relationFilterValueSchema,
    [ViewFilterOperand.IS_NOT]: relationFilterValueSchema,
  },
  UUID: {
    [ViewFilterOperand.IS]: strictArrayOfUuidOrVariableSchema,
    [ViewFilterOperand.IS_NOT]: strictArrayOfUuidOrVariableSchema,
  },
  BOOLEAN: {
    [ViewFilterOperand.IS]: booleanFilterValueSchema,
  },
  TS_VECTOR: {
    [ViewFilterOperand.VECTOR_SEARCH]: nonEmptyStringFilterValueSchema,
  },
} as const satisfies FilterValueSchemasMap;

export const COMPOSITE_SUB_FIELD_VALUE_SCHEMAS = {
  ACTOR: {
    source: {
      [ViewFilterOperand.IS]: actorSourceFilterValueSchema,
      [ViewFilterOperand.IS_NOT]: actorSourceFilterValueSchema,
    },
    workspaceMemberId: {
      [ViewFilterOperand.IS]: relationFilterValueSchema,
      [ViewFilterOperand.IS_NOT]: relationFilterValueSchema,
    },
  },
  CURRENCY: {
    currencyCode: {
      [ViewFilterOperand.IS]: arrayOfStringsOrVariablesSchema,
      [ViewFilterOperand.IS_NOT]: arrayOfStringsOrVariablesSchema,
    },
  },
  ADDRESS: {
    addressCountry: {
      [ViewFilterOperand.CONTAINS]: arrayOfStringsOrVariablesSchema,
      [ViewFilterOperand.DOES_NOT_CONTAIN]: arrayOfStringsOrVariablesSchema,
    },
  },
} as const satisfies Partial<
  Record<
    keyof typeof FILTER_OPERANDS_MAP,
    Record<string, Partial<Record<ViewFilterOperand, z.ZodType>>>
  >
>;

export const FILTER_VALUE_FORMAT_HINTS: Partial<
  Record<ViewFilterOperand, string>
> = {
  [ViewFilterOperand.IS_RELATIVE]:
    'Expected a stringified relative date such as "NEXT_30_DAY", not an object.',
  [ViewFilterOperand.VECTOR_SEARCH]: 'Expected a non empty search string.',
};
