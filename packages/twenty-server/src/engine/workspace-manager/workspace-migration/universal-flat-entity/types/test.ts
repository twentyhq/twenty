import { type Equal, type Expect } from 'twenty-shared/testing';
import { ExtractJsonbProperties, JsonbProperty } from 'twenty-shared/types';

type TestedRecord = {
  // Non-JsonbProperty fields
  plainString: string;
  plainNumber: number;
  plainObject: {};
  plainObjectNullable: {} | null;
  plainArray: string[];
  plainUnknown: unknown;

  // JsonbProperty fields - should be extracted
  jsonbEmpty: JsonbProperty<{}>;
  jsonbString: JsonbProperty<string>;
  jsonbNumber: JsonbProperty<number>;
  jsonbArray: JsonbProperty<string[]>;
  jsonbNested: JsonbProperty<{ nested: { deep: number } }>;
  jsonbNullable: JsonbProperty<{}> | null;
  jsonbUndefinable: JsonbProperty<{}> | undefined;
  jsonbOptional?: JsonbProperty<{}>;
  jsonbInnerNullable: JsonbProperty<{} | null>;
  jsonbInnerUndefinable: JsonbProperty<{} | undefined>;
};

type TestResult = ExtractJsonbProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      TestResult,
      | 'jsonbEmpty'
      | 'jsonbString'
      | 'jsonbNumber'
      | 'jsonbArray'
      | 'jsonbNested'
      | 'jsonbNullable'
      | 'jsonbUndefinable'
      | 'jsonbOptional'
      | 'jsonbInnerNullable'
      | 'jsonbInnerUndefinable'
    >
  >,

  // Empty object returns never
  Expect<Equal<ExtractJsonbProperties<{}>, never>>,

  // Object with no JsonbProperty fields returns never
  Expect<Equal<ExtractJsonbProperties<{ a: string; b: number }>, never>>,
];
