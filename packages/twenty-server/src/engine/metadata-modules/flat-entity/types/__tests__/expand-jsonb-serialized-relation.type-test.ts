import { type Equal, type Expect } from 'twenty-shared/testing';
import { type SerializedRelation } from 'twenty-shared/types';

import { type ExpandJsonbSerializedRelation } from 'src/engine/metadata-modules/flat-entity/types/expand-jsonb-serialized-relation.type';
import {
  type JSONB_PROPERTY_BRAND,
  type JsonbProperty,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

type BrandedObjectWithRelation = JsonbProperty<{
  name: string;
  targetFieldMetadataId: SerializedRelation;
}>;

type BrandedObjectWithoutRelation = JsonbProperty<{
  name: string;
  count: number;
}>;

type UnbrandedObject = {
  name: string;
  targetFieldMetadataId: SerializedRelation;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type BrandedObjectAssertions = [
  // Branded object with SerializedRelation: Id property kept AND UniversalIdentifier added
  Expect<
    Equal<
      ExpandJsonbSerializedRelation<BrandedObjectWithRelation>,
      {
        name: string;
        targetFieldMetadataId: SerializedRelation;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }
    >
  >,

  // Branded object without SerializedRelation: no expansion, just removes brand
  Expect<
    Equal<
      ExpandJsonbSerializedRelation<BrandedObjectWithoutRelation>,
      {
        name: string;
        count: number;
      }
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type UnbrandedObjectAssertions = [
  // Unbranded objects pass through unchanged
  Expect<
    Equal<ExpandJsonbSerializedRelation<UnbrandedObject>, UnbrandedObject>
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type PrimitiveAssertions = [
  // Primitives pass through unchanged
  Expect<Equal<ExpandJsonbSerializedRelation<string>, string>>,
  Expect<Equal<ExpandJsonbSerializedRelation<number>, number>>,
  Expect<Equal<ExpandJsonbSerializedRelation<null>, null>>,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
  // Array of branded objects: transforms each element
  Expect<
    Equal<
      ExpandJsonbSerializedRelation<BrandedObjectWithRelation[]>,
      {
        name: string;
        targetFieldMetadataId: SerializedRelation;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }[]
    >
  >,

  // Array of unbranded objects: passes through unchanged
  Expect<
    Equal<ExpandJsonbSerializedRelation<UnbrandedObject[]>, UnbrandedObject[]>
  >,

  // Array of primitives: passes through unchanged
  Expect<Equal<ExpandJsonbSerializedRelation<string[]>, string[]>>,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  // Union with null: transforms branded object, keeps null
  Expect<
    Equal<
      ExpandJsonbSerializedRelation<BrandedObjectWithRelation | null>,
      {
        name: string;
        targetFieldMetadataId: SerializedRelation;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      } | null
    >
  >,
];

type MultipleRelationsObject = JsonbProperty<{
  name: string;
  sourceFieldId: SerializedRelation;
  targetFieldId: SerializedRelation;
  regularId: string;
}>;

// eslint-disable-next-line unused-imports/no-unused-vars
type MultipleRelationsAssertions = [
  // Multiple SerializedRelation properties: all get expanded (original kept + universal added)
  Expect<
    Equal<
      ExpandJsonbSerializedRelation<MultipleRelationsObject>,
      {
        name: string;
        sourceFieldId: SerializedRelation;
        sourceFieldUniversalIdentifier: SerializedRelation;
        targetFieldId: SerializedRelation;
        targetFieldUniversalIdentifier: SerializedRelation;
        regularId: string;
      }
    >
  >,
];

// Verify brand is removed
type BrandRemovedCheck =
  ExpandJsonbSerializedRelation<BrandedObjectWithRelation>;

// eslint-disable-next-line unused-imports/no-unused-vars
type BrandRemovedAssertion = Expect<
  Equal<
    typeof JSONB_PROPERTY_BRAND extends keyof BrandRemovedCheck ? true : false,
    false
  >
>;
