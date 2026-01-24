import { type Equal, type Expect } from 'twenty-shared/testing';

import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObject = {};

type TestedRecord = {
  // Non-JsonbProperty fields
  plainString: string;
  plainNumber: number;
  plainObject: EmptyObject;
  plainObjectNullable: EmptyObject | null;
  plainArray: string[];
  plainUnknown: unknown;
  jsonbString: JsonbProperty<string>;
  jsonbPlainUnknown: JsonbProperty<unknown>;
  jsonbNumber: JsonbProperty<number>;
  jsonbull: JsonbProperty<null>;

  // JsonbProperty fields - should be extracted
  jsonbPlainObject: JsonbProperty<EmptyObject>;
  jsonbPlainArray: JsonbProperty<string[]>;
  jsonbPlainObjectNullable: JsonbProperty<EmptyObject | null>;
  jsonbEmpty: JsonbProperty<EmptyObject>;
  jsonbArray: JsonbProperty<string[]>;
  jsonbNested: JsonbProperty<{ nested: { deep: number } }>;
  jsonbNullable: JsonbProperty<EmptyObject> | null;
  jsonbUndefinable: JsonbProperty<EmptyObject> | undefined;
  jsonbOptional?: JsonbProperty<EmptyObject>;
  jsonbInnerNullable: JsonbProperty<EmptyObject | null>;
  jsonbInnerUndefinable: JsonbProperty<EmptyObject | undefined>;
  jsonbUnionWithPrimitive: JsonbProperty<EmptyObject> | string | null;
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
  Expect<Equal<ExtractJsonbProperties<EmptyObject>, never>>,

  // Object with no JsonbProperty fields returns never
  Expect<Equal<ExtractJsonbProperties<{ a: string; b: number }>, never>>,
];
