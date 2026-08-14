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

// oxlint-disable-next-line unused-imports/no-unused-vars
type ObjectAssertions = [
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithRelation>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
      }
    >
  >,

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

  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithoutRelation>,
      ObjectWithoutRelation
    >
  >,
];

// oxlint-disable-next-line unused-imports/no-unused-vars
type PrimitiveAssertions = [
  Expect<Equal<FormatRecordSerializedRelationProperties<string>, string>>,
  Expect<Equal<FormatRecordSerializedRelationProperties<number>, number>>,
  Expect<Equal<FormatRecordSerializedRelationProperties<null>, null>>,
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<SerializedRelation>,
      SerializedRelation | null
    >
  >,
];

// oxlint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithRelation[]>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
      }[]
    >
  >,

  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithoutRelation[]>,
      ObjectWithoutRelation[]
    >
  >,

  Expect<Equal<FormatRecordSerializedRelationProperties<string[]>, string[]>>,

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

// oxlint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<ObjectWithRelation | null>,
      {
        name: string;
        targetFieldMetadataUniversalIdentifier: SerializedRelation | null;
      } | null
    >
  >,

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

// oxlint-disable-next-line unused-imports/no-unused-vars
type MultipleRelationsAssertions = [
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

// oxlint-disable-next-line unused-imports/no-unused-vars
type NestedObjectAssertions = [
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

// oxlint-disable-next-line unused-imports/no-unused-vars
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

  Expect<
    Equal<
      FormatRecordSerializedRelationProperties<
        Record<string, { value: number }>
      >,
      Record<string, { value: number }>
    >
  >,
];
