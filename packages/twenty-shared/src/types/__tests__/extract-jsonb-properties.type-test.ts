import { type ExtractJsonbProperties } from '@/types/ExtractJsonbProperties.type';
import { type JsonbProperty } from '@/types/JsonbProperty.type';
import { type Equal, type Expect } from 'twenty-shared/testing';

type TestedRecord = {
  // Non-JsonbProperty fields
  plainString: string;
  plainNumber: number;
  plainObject: {};
  plainObjectNullable: {} | null;
  plainArray: string[];
  plainUnknown: unknown;

  // JsonbProperty fields - should be extracted
  jsonbPlainString: JsonbProperty<string>;
  jsonbPlainNumber: JsonbProperty<number>;
  jsonbPlainUnknown: JsonbProperty<unknown>;
  jsonbString: JsonbProperty<string>;
  jsonbNumber: JsonbProperty<number>;
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

  jsonbInnerNullableWithProperties: JsonbProperty<null | { value: string }>;
};

type TestResult = ExtractJsonbProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      TestResult,
      | 'jsonbPlainString'
      | 'jsonbPlainNumber'
      | 'jsonbPlainUnknown'
      | 'jsonbString'
      | 'jsonbNumber'
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
    >
  >,

  // Empty object returns never
  Expect<Equal<ExtractJsonbProperties<{}>, never>>,

  // Object with no JsonbProperty fields returns never
  Expect<Equal<ExtractJsonbProperties<{ a: string; b: number }>, never>>,
];
