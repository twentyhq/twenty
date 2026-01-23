import { ExtractSerializedRelationProperties } from '@/types/ExtractSerializedRelationProperties.type';
import { SerializedRelation } from '@/types/SerializedRelation.type';
import { type Equal, type Expect } from 'twenty-shared/testing';

type TestedRecord = {
  test1: string;
  test2: string;
  test3: SerializedRelation;
  test4?: SerializedRelation;
  test5?: SerializedRelation | null;
  test6: SerializedRelation | undefined;
};

type FieldMetadataRelationSettingsSerializedRelations =
  ExtractSerializedRelationProperties<TestedRecord>;

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<
    Equal<
      FieldMetadataRelationSettingsSerializedRelations,
      'test3' | 'test4' | 'test5' | 'test6'
    >
  >,
];
