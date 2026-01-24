import { type ExtractSerializedRelationProperties } from '@/types/ExtractSerializedRelationProperties.type';
import { type SerializedRelation } from '@/types/SerializedRelation.type';
import { type Equal, type Expect } from 'twenty-shared/testing';
import { Prettify } from 'zod/v4/core/util.cjs';

type TestedRecord = {
  // Non-SerializedRelation fields
  plainString: string;
  plainNumber: number;
  plainBoolean: boolean;
  plainObject: { id: string };
  plainArray: string[];
  plainUnknown: unknown;
  plainStringNullable: string | null;
  plainStringOptional?: string;

  // SerializedRelation fields - should be extracted
  relation: SerializedRelation;
  relationNullable: SerializedRelation | null;
  relationUndefinable: SerializedRelation | undefined;
  relationOptional?: SerializedRelation;
  relationOptionalNullable?: SerializedRelation | null;
};

type TestResult = ExtractSerializedRelationProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      TestResult,
      | 'relation'
      | 'relationNullable'
      | 'relationUndefinable'
      | 'relationOptional'
      | 'relationOptionalNullable'
    >
  >,

  // Empty object returns never
  Expect<Equal<ExtractSerializedRelationProperties<{}>, never>>,

  // Object with no SerializedRelation fields returns never
  Expect<
    Equal<ExtractSerializedRelationProperties<{ a: string; b: number }>, never>
  >,
];

type Union0 = {
  no: string;
  foo: SerializedRelation;
  bar: boolean;
  no2: number;
  type: 'foo';
};

type Union1 = {
  ma: string;
  ti: number;
  bar: SerializedRelation | undefined;
  type: 'bar';
};

type TestedUnionType = Union0 | Union1;

type Tool<T> = T extends unknown
  ? {
      [P in keyof T as P extends ExtractSerializedRelationProperties<T> & string
        ? `${P}UniversalIdentifier`
        : P]: T[P];
    }
  : never;

type _TestResult = Prettify<Tool<TestedUnionType>>;

const tmp: _TestResult = {
  type: 'foo',
  fooUniversalIdentifier: '',
  no: '',
  no2: 2,
  bar: true,
};

// eslint-disable-next-line unused-imports/no-unused-vars
type _Assertions = [
  Expect<
    Equal<
      _TestResult,
      | {
          no: string;
          fooUniversalIdentifier: SerializedRelation;
          no2: number;
          type: 'foo';
          bar: boolean;
        }
      | {
          ma: string;
          ti: number;
          barUniversalIdentifier: SerializedRelation | undefined;
          type: 'bar';
        }
    >
  >,
];
