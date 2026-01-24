import { type ExtractSerializedRelationProperties } from '@/types/ExtractSerializedRelationProperties.type';
import { type SerializedRelation } from '@/types/SerializedRelation.type';
import { type Equal, type Expect } from 'twenty-shared/testing';

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
