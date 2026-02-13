import { type Equal, type Expect } from 'twenty-shared/testing';
import {
  type SerializedRelation,
  type FormatRecordSerializedRelationProperties,
} from 'twenty-shared/types';

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
  // Object with SerializedRelation: Id suffix renamed to UniversalIdentifier, value becomes nullable
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithRelation>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
      }
    >
  >,

  // Branded object with SerializedRelation: renames property, preserves brand key, value becomes nullable
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<BrandedObjectWithRelation>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
        __JsonbPropertyBrand__?: undefined;
      }
    >
  >,

  // Object without SerializedRelation: no changes
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithoutRelation>,
      ObjectWithoutRelation
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type PrimitiveAssertions = [
  // Primitives pass through unchanged
  Expect<Equal<FormatRecordSerializedRelationProperties<string>, string>>,
  Expect<Equal<FormatRecordSerializedRelationProperties<number>, number>>,
  Expect<Equal<FormatRecordSerializedRelationProperties<null>, null>>,
  // SerializedRelation becomes nullable
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<SerializedRelation>,
      SerializedRelation | null
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
  // Array of objects with relation: transforms each element
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithRelation[]>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
      }[]
    >
  >,

  // Array of objects without relation: passes through unchanged
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithoutRelation[]>,
      ObjectWithoutRelation[]
    >
  >,

  // Array of primitives: passes through unchanged
  Expect<Equal<FormatRecordSerializedRelationProperties<string[]>, string[]>>,

  // Nested array of objects: transforms innermost elements
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithRelation[][]>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
      }[][]
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  // Union with null: transforms object, keeps null
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithRelation | null>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
      } | null
    >
  >,

  // Array of union: transforms elements appropriately
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<(ObjectWithRelation | null)[]>,
      ({
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
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
  // Multiple SerializedRelation properties: all get renamed and become nullable
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<MultipleRelationsObject>,
      {
        name: string;
        sourceFieldUniversalIdentifier: SerializedRelation | null;
        targetFieldUniversalIdentifier: SerializedRelation | null;
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
      FormatRecordSerializedRelationProperties<NestedObjectWithRelation>,
      {
        name: string;
        nested: {
          fieldMetadataUniversalIdentifier: SerializedRelation | null;
        };
      }
    >
  >,

  // Deeply nested object: transforms relation at any depth
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<DeeplyNestedObjectWithRelation>,
      {
        name: string;
        level1: {
          level2: {
            targetUniversalIdentifier: SerializedRelation | null;
          };
        };
      }
    >
  >,

  // Mixed: transforms both direct and nested relations
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<MixedNestedObject>,
      {
        name: string;
        directRelationUniversalIdentifier: SerializedRelation | null;
        nested: {
          nestedRelationUniversalIdentifier: SerializedRelation | null;
          plainField: string;
        };
      }
    >
  >,

  // Nullable nested object: transforms relation inside, preserves union with null
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<NullableNestedObject>,
      {
        name: string;
        nested: {
          relationUniversalIdentifier: SerializedRelation | null;
        } | null;
      }
    >
  >,

  // Nested with array of objects: transforms relations inside array elements
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<NestedWithArrayOfObjects>,
      {
        name: string;
        items: {
          itemRelationUniversalIdentifier: SerializedRelation | null;
        }[];
      }
    >
  >,
];

// JSON Schema-like structures with Record<string, X> properties
// These should NOT have their 'properties' key renamed
type JsonSchemaLikeObject = {
  type: 'object';
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
};

type JsonSchemaUnion =
  | { type: 'text' }
  | {
      type: 'json';
      schema: JsonSchemaLikeObject;
    };

type BrandedJsonSchemaUnion = JsonbProperty<JsonSchemaUnion>;

// eslint-disable-next-line unused-imports/no-unused-vars
type RecordPropertyAssertions = [
  // Object with 'properties' key containing Record<string, X>:
  // The 'properties' key should NOT be renamed to 'propertiesUniversalIdentifier'
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<JsonSchemaLikeObject>,
      {
        type: 'object';
        properties: Record<string, { type: string; description?: string }>;
        required?: string[];
      }
    >
  >,

  // Union type with JSON schema: properties inside schema should stay as 'properties'
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<JsonSchemaUnion>,
      | { type: 'text' }
      | {
          type: 'json';
          schema: {
            type: 'object';
            properties: Record<string, { type: string; description?: string }>;
            required?: string[];
          };
        }
    >
  >,

  // Branded JSON schema union: should preserve structure, only add brand
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<BrandedJsonSchemaUnion>,
      | { type: 'text'; __JsonbPropertyBrand__?: undefined }
      | {
          type: 'json';
          schema: {
            type: 'object';
            properties: Record<string, { type: string; description?: string }>;
            required?: string[];
          };
          __JsonbPropertyBrand__?: undefined;
        }
    >
  >,

  // Plain Record<string, X> should pass through unchanged
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<
        Record<string, { value: number }>
      >,
      Record<string, { value: number }>
    >
  >,
];
