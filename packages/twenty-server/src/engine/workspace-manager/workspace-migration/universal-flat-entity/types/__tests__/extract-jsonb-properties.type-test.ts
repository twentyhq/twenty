import { type ExtractJsonbProperties } from '../extract-jsonb-properties.type';
import { type JsonbProperty } from '../jsonb-property.type';
import { type Equal, type Expect } from 'twenty-shared/testing';

type TestedRecord = {
  // Non-JsonbProperty fields
  plainString: string;
  plainNumber: number;
  plainObject: {};
  plainObjectNullable: {} | null;
  plainArray: string[];
  plainUnknown: unknown;
  jsonbString: JsonbProperty<string>;
  jsonbPlainUnknown: JsonbProperty<unknown>;
  jsonbNumber: JsonbProperty<number>;
  jsonbull: JsonbProperty<null>;

  // JsonbProperty fields - should be extracted
  jsonbPlainObject: JsonbProperty<{}>;
  jsonbPlainArray: JsonbProperty<string[]>;
  jsonbPlainObjectNullable: JsonbProperty<{} | null>;
  jsonbEmpty: JsonbProperty<{}>;
  jsonbArray: JsonbProperty<string[]>;
  jsonbNested: JsonbProperty<{ nested: { deep: number } }>;
  jsonbNullable: JsonbProperty<{}> | null;
  jsonbUndefinable: JsonbProperty<{}> | undefined;
  jsonbOptional?: JsonbProperty<{}>;
  jsonbInnerNullable: JsonbProperty<{} | null>;
  jsonbInnerUndefinable: JsonbProperty<{} | undefined>;
  jsonbUnionWithPrimitive: JsonbProperty<{}> | string | null;
  jsonbInnerNullableWithProperties: JsonbProperty<null | { value: string }>;
  wrongUsageButPassing:
    | JsonbProperty<null | { value: string }>
    | string
    | { foo: string };
};

type TestResult = ExtractJsonbProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      TestResult,
      | 'jsonbPlainObject'
      | 'jsonbPlainArray'
      | 'jsonbPlainObjectNullable'
      | 'jsonbEmpty'
      | 'jsonbArray'
      | 'jsonbNested'
      | 'jsonbNullable'
      | 'jsonbUndefinable'
      | 'jsonbOptional'
      | 'jsonbInnerNullable'
      | 'jsonbInnerUndefinable'
      | 'jsonbInnerNullableWithProperties'
      | 'jsonbUnionWithPrimitive'
      | 'wrongUsageButPassing'
    >
  >,

  // Empty object returns never
  Expect<Equal<ExtractJsonbProperties<{}>, never>>,

  // Object with no JsonbProperty fields returns never
  Expect<Equal<ExtractJsonbProperties<{ a: string; b: number }>, never>>,
];
