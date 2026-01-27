import { type Equal, type Expect } from 'twenty-shared/testing';
import { type SerializedRelation } from 'twenty-shared/types';

import { type FormatJsonbSerializedRelation } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/format-jsonb-serialized-relation.type';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

type ObjectWithRelation = {
  name: string;
  targetFieldMetadataId: SerializedRelation;
};

type ObjectWithoutRelation = {
  name: string;
  count: number;
};

type BrandedObjectWithRelation = JsonbProperty<ObjectWithRelation>;

// eslint-disable-next-line unused-imports/no-unused-vars
type ObjectAssertions = [
  // Object with SerializedRelation: Id suffix renamed to UniversalIdentifier
  Expect<
    Equal<
      FormatJsonbSerializedRelation<ObjectWithRelation>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }
    >
  >,

  // Branded object with SerializedRelation: renames property, preserves brand key
  Expect<
    Equal<
      FormatJsonbSerializedRelation<BrandedObjectWithRelation>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
        __JsonbPropertyBrand__?: undefined;
      }
    >
  >,

  // Object without SerializedRelation: no changes
  Expect<
    Equal<
      FormatJsonbSerializedRelation<ObjectWithoutRelation>,
      ObjectWithoutRelation
    >
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
  // Array of objects with relation: transforms each element
  Expect<
    Equal<
      FormatJsonbSerializedRelation<ObjectWithRelation[]>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }[]
    >
  >,

  // Array of objects without relation: passes through unchanged
  Expect<
    Equal<
      FormatJsonbSerializedRelation<ObjectWithoutRelation[]>,
      ObjectWithoutRelation[]
    >
  >,

  // Array of primitives: passes through unchanged
  Expect<Equal<FormatJsonbSerializedRelation<string[]>, string[]>>,

  // Nested array of objects: transforms innermost elements
  Expect<
    Equal<
      FormatJsonbSerializedRelation<ObjectWithRelation[][]>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      }[][]
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  // Union with null: transforms object, keeps null
  Expect<
    Equal<
      FormatJsonbSerializedRelation<ObjectWithRelation | null>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      } | null
    >
  >,

  // Array of union: transforms elements appropriately
  Expect<
    Equal<
      FormatJsonbSerializedRelation<(ObjectWithRelation | null)[]>,
      ({
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation;
      } | null)[]
    >
  >,
];

type MultipleRelationsObject = {
  name: string;
  sourceFieldId: SerializedRelation;
  targetFieldId: SerializedRelation;
  regularId: string;
};

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

type NestedObjectWithRelation = {
  name: string;
  nested: {
    fieldMetadataId: SerializedRelation;
  };
};

type DeeplyNestedObjectWithRelation = {
  name: string;
  level1: {
    level2: {
      targetId: SerializedRelation;
    };
  };
};

type MixedNestedObject = {
  name: string;
  directRelationId: SerializedRelation;
  nested: {
    nestedRelationId: SerializedRelation;
    plainField: string;
  };
};

type NullableNestedObject = {
  name: string;
  nested: {
    relationId: SerializedRelation;
  } | null;
};

type NestedWithArrayOfObjects = {
  name: string;
  items: {
    itemRelationId: SerializedRelation;
  }[];
};

// eslint-disable-next-line unused-imports/no-unused-vars
type NestedObjectAssertions = [
  // Simple nested object: transforms relation inside nested object
  Expect<
    Equal<
      FormatJsonbSerializedRelation<NestedObjectWithRelation>,
      {
        name: string;
        nested: {
          fieldMetadataUniversalIdentifier: SerializedRelation;
        };
      }
    >
  >,

  // Deeply nested object: transforms relation at any depth
  Expect<
    Equal<
      FormatJsonbSerializedRelation<DeeplyNestedObjectWithRelation>,
      {
        name: string;
        level1: {
          level2: {
            targetUniversalIdentifier: SerializedRelation;
          };
        };
      }
    >
  >,

  // Mixed: transforms both direct and nested relations
  Expect<
    Equal<
      FormatJsonbSerializedRelation<MixedNestedObject>,
      {
        name: string;
        directRelationUniversalIdentifier: SerializedRelation;
        nested: {
          nestedRelationUniversalIdentifier: SerializedRelation;
          plainField: string;
        };
      }
    >
  >,

  // Nullable nested object: transforms relation inside, preserves union with null
  Expect<
    Equal<
      FormatJsonbSerializedRelation<NullableNestedObject>,
      {
        name: string;
        nested: {
          relationUniversalIdentifier: SerializedRelation;
        } | null;
      }
    >
  >,

  // Nested with array of objects: transforms relations inside array elements
  Expect<
    Equal<
      FormatJsonbSerializedRelation<NestedWithArrayOfObjects>,
      {
        name: string;
        items: {
          itemRelationUniversalIdentifier: SerializedRelation;
        }[];
      }
    >
  >,
];
