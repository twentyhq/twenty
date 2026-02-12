import { type Equal, type Expect } from '@/testing';
import { type ExtractSerializedRelationProperties } from '@/types/ExtractSerializedRelationProperties.type';
import { type SerializedRelation } from '@/types/SerializedRelation.type';

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

  // Object with no SerializedRelation fields returns never
  Expect<
    Equal<ExtractSerializedRelationProperties<{ a: string; b: number }>, never>
  >,

  // Primitives return never (tests T extends object branch)
  Expect<Equal<ExtractSerializedRelationProperties<string>, never>>,
  Expect<Equal<ExtractSerializedRelationProperties<number>, never>>,
  Expect<Equal<ExtractSerializedRelationProperties<null>, never>>,

  // Empty object returns never
  Expect<Equal<ExtractSerializedRelationProperties<object>, never>>,

  // Union types distribute correctly
  Expect<
    Equal<
      ExtractSerializedRelationProperties<
        { a: SerializedRelation } | { b: SerializedRelation }
      >,
      'a' | 'b'
    >
  >,

  // Mixed union with object and primitive
  Expect<
    Equal<
      ExtractSerializedRelationProperties<{ rel: SerializedRelation } | string>,
      'rel'
    >
  >,

  // Types with string index signatures should return never
  // (string index signatures shouldn't be mistaken for the brand)
  Expect<
    Equal<ExtractSerializedRelationProperties<Record<string, string>>, never>
  >,
  Expect<
    Equal<
      ExtractSerializedRelationProperties<
        Record<string, { type: string; description?: string }>
      >,
      never
    >
  >,
];
