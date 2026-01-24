import { type Equal, type Expect } from 'twenty-shared/testing';
import {
  type JSONB_PROPERTY_BRAND,
  type JsonbProperty,
  type SerializedRelation,
} from 'twenty-shared/types';

import { type FormatJsonbSerializedRelation } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/format-jsonb-serialized-relation.type';

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
  // Branded object with SerializedRelation: Id suffix renamed to UniversalIdentifier
  Expect<
    Equal<
      FormatJsonbSerializedRelation<BrandedObjectWithRelation>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }
    >
  >,

  // Branded object without SerializedRelation: no renaming, just removes brand
  Expect<
    Equal<
      FormatJsonbSerializedRelation<BrandedObjectWithoutRelation>,
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
    Equal<FormatJsonbSerializedRelation<UnbrandedObject>, UnbrandedObject>
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type PrimitiveAssertions = [
  // Primitives pass through unchanged
  Expect<Equal<FormatJsonbSerializedRelation<string>, string>>,
  Expect<Equal<FormatJsonbSerializedRelation<number>, number>>,
  Expect<Equal<FormatJsonbSerializedRelation<null>, null>>,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
  // Array of branded objects: transforms each element
  Expect<
    Equal<
      FormatJsonbSerializedRelation<BrandedObjectWithRelation[]>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }[]
    >
  >,

  // Array of unbranded objects: passes through unchanged
  Expect<
    Equal<FormatJsonbSerializedRelation<UnbrandedObject[]>, UnbrandedObject[]>
  >,

  // Array of primitives: passes through unchanged
  Expect<Equal<FormatJsonbSerializedRelation<string[]>, string[]>>,

  // Nested array of branded objects: transforms innermost elements
  Expect<
    Equal<
      FormatJsonbSerializedRelation<BrandedObjectWithRelation[][]>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }[][]
    >
  >,

  // Array of unbranded and branded objects union: transforms branded element
  Expect<
    Equal<
      FormatJsonbSerializedRelation<
        (BrandedObjectWithRelation | UnbrandedObject)[]
      >,
      (
        | {
            name: string;
            targetFieldMetadataUniversalIdentifier: SerializedRelation;
          }
        | UnbrandedObject
      )[]
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  // Union with null: transforms branded object, keeps null
  Expect<
    Equal<
      FormatJsonbSerializedRelation<BrandedObjectWithRelation | null>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      } | null
    >
  >,

  // Array of union: transforms elements appropriately
  Expect<
    Equal<
      FormatJsonbSerializedRelation<(BrandedObjectWithRelation | null)[]>,
      ({
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      } | null)[]
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
  // Multiple SerializedRelation properties: all get renamed
  Expect<
    Equal<
      FormatJsonbSerializedRelation<MultipleRelationsObject>,
      {
        name: string;
        sourceFieldUniversalIdentifier: SerializedRelation;
        targetFieldUniversalIdentifier: SerializedRelation;
        regularId: string;
      }
    >
  >,
];

// Verify brand is removed
type BrandRemovedCheck =
  FormatJsonbSerializedRelation<BrandedObjectWithRelation>;

// eslint-disable-next-line unused-imports/no-unused-vars
type BrandRemovedAssertion = Expect<
  Equal<
    typeof JSONB_PROPERTY_BRAND extends keyof BrandRemovedCheck ? true : false,
    false
  >
>;
