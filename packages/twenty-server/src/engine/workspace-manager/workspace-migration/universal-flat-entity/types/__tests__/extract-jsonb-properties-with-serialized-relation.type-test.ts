import { type Equal, type Expect } from 'twenty-shared/testing';
import { type SerializedRelation } from 'twenty-shared/types';

import { type ExtractJsonbPropertiesWithSerializedRelation } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties-with-serialized-relation.type';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObject = {};

// Basic test record with various property types
type BasicTestRecord = {
  // Non-JSONB properties (should never be extracted)
  plainString: string;
  plainNumber: number;
  plainSerializedRelation: SerializedRelation;

  // JSONB properties WITHOUT SerializedRelation (should NOT be extracted)
  jsonbPlainObject: JsonbProperty<{ name: string; count: number }>;
  jsonbString: JsonbProperty<string>;
  jsonbNumber: JsonbProperty<number>;
  jsonbArray: JsonbProperty<string[]>;

  // JSONB properties WITH direct SerializedRelation (should be extracted)
  jsonbWithDirectRelation: JsonbProperty<{
    name: string;
    targetId: SerializedRelation;
  }>;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type BasicAssertions = [
  // Only jsonbWithDirectRelation should be extracted
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<BasicTestRecord>,
      'jsonbWithDirectRelation'
    >
  >,

  // Empty object returns never
  Expect<
    Equal<ExtractJsonbPropertiesWithSerializedRelation<EmptyObject>, never>
  >,

  // Object with no JSONB properties returns never
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<{
        a: string;
        b: SerializedRelation;
      }>,
      never
    >
  >,

  // Object with JSONB but no SerializedRelation returns never
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<{
        data: JsonbProperty<{ name: string }>;
      }>,
      never
    >
  >,

  // JSONB with 2D string array (no SerializedRelation) should return never
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<{
        duplicateCriteria: JsonbProperty<string[][]>;
      }>,
      never
    >
  >,

  // JSONB with 2D number array (no SerializedRelation) should return never
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<{
        matrix: JsonbProperty<number[][]>;
      }>,
      never
    >
  >,

  // JSONB with nested array of plain objects should return never
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<{
        grid: JsonbProperty<{ x: number; y: number }[][]>;
      }>,
      never
    >
  >,
];

// Nested object tests
type NestedTestRecord = {
  // JSONB with nested SerializedRelation (should be extracted)
  jsonbNestedRelation: JsonbProperty<{
    outer: {
      inner: {
        relationId: SerializedRelation;
      };
    };
  }>;

  // JSONB with deeply nested no relation (should NOT be extracted)
  jsonbNestedNoRelation: JsonbProperty<{
    outer: {
      inner: {
        value: string;
      };
    };
  }>;

  // JSONB with mixed nested (has relation) (should be extracted)
  jsonbMixedNested: JsonbProperty<{
    name: string;
    nested: {
      targetId: SerializedRelation;
      description: string;
    };
  }>;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type NestedAssertions = [
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<NestedTestRecord>,
      'jsonbNestedRelation' | 'jsonbMixedNested'
    >
  >,
];

// Array tests
type ArrayTestRecord = {
  // JSONB with array of SerializedRelation (should be extracted)
  jsonbArrayOfRelations: JsonbProperty<SerializedRelation[]>;

  // JSONB with array of objects containing SerializedRelation (should be extracted)
  jsonbArrayOfObjectsWithRelation: JsonbProperty<
    { id: string; targetId: SerializedRelation }[]
  >;

  // JSONB with array of plain objects (should NOT be extracted)
  jsonbArrayOfPlainObjects: JsonbProperty<{ name: string; count: number }[]>;

  // JSONB with nested array containing SerializedRelation (should be extracted)
  jsonbNestedArrayWithRelation: JsonbProperty<{
    items: { relationId: SerializedRelation }[];
  }>;

  // JSONB with 2D array of SerializedRelation (should be extracted)
  jsonb2DArrayOfRelations: JsonbProperty<SerializedRelation[][]>;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<ArrayTestRecord>,
      | 'jsonbArrayOfRelations'
      | 'jsonbArrayOfObjectsWithRelation'
      | 'jsonbNestedArrayWithRelation'
      | 'jsonb2DArrayOfRelations'
    >
  >,
];

// Union type tests
type UnionTestRecord = {
  // JSONB with union containing SerializedRelation (should be extracted)
  jsonbUnionWithRelation: JsonbProperty<
    | { type: 'ref'; targetId: SerializedRelation }
    | { type: 'plain'; name: string }
  >;

  // JSONB with nullable SerializedRelation (should be extracted)
  jsonbNullableRelation: JsonbProperty<{
    targetId: SerializedRelation | null;
  }>;

  // JSONB with union of plain types only (should NOT be extracted)
  jsonbUnionNoRelation: JsonbProperty<
    { type: 'a'; value: string } | { type: 'b'; count: number }
  >;

  // JSONB with optional SerializedRelation property (should be extracted)
  jsonbOptionalRelation: JsonbProperty<{
    name: string;
    targetId?: SerializedRelation;
  }>;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<UnionTestRecord>,
      | 'jsonbUnionWithRelation'
      | 'jsonbNullableRelation'
      | 'jsonbOptionalRelation'
    >
  >,
];

// Nullable and optional JSONB property tests
type NullableOptionalTestRecord = {
  // Nullable JSONB with SerializedRelation (should be extracted)
  jsonbNullable: JsonbProperty<{ targetId: SerializedRelation }> | null;

  // Optional JSONB with SerializedRelation (should be extracted)
  jsonbOptional?: JsonbProperty<{ targetId: SerializedRelation }>;

  // Undefined union JSONB with SerializedRelation (should be extracted)
  jsonbUndefinable: JsonbProperty<{ targetId: SerializedRelation }> | undefined;

  // Nullable JSONB without SerializedRelation (should NOT be extracted)
  jsonbNullableNoRelation: JsonbProperty<{ name: string }> | null;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type NullableOptionalAssertions = [
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<NullableOptionalTestRecord>,
      'jsonbNullable' | 'jsonbOptional' | 'jsonbUndefinable'
    >
  >,
];

// Complex real-world scenario
type RealWorldRecord = {
  id: string;
  name: string;

  // Settings without relations
  displaySettings: JsonbProperty<{
    theme: 'light' | 'dark';
    fontSize: number;
  }>;

  // Workflow config with relation references
  workflowConfig: JsonbProperty<{
    steps: {
      stepId: string;
      assigneeId: SerializedRelation;
      action: string;
    }[];
  }>;

  // Metadata with nested relations
  metadata: JsonbProperty<{
    createdBy: {
      userId: SerializedRelation;
      timestamp: string;
    };
    modifiedBy: {
      userId: SerializedRelation;
      timestamp: string;
    } | null;
  }>;

  // Plain relation (not JSONB)
  ownerId: SerializedRelation;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type RealWorldAssertions = [
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<RealWorldRecord>,
      'workflowConfig' | 'metadata'
    >
  >,
];

// Edge case: SerializedRelation as direct JSONB value
type DirectRelationTestRecord = {
  // JSONB wrapping SerializedRelation directly (should be extracted)
  jsonbDirectRelation: JsonbProperty<SerializedRelation>;

  // JSONB wrapping nullable SerializedRelation directly (should be extracted)
  jsonbDirectNullableRelation: JsonbProperty<SerializedRelation | null>;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type DirectRelationAssertions = [
  Expect<
    Equal<
      ExtractJsonbPropertiesWithSerializedRelation<DirectRelationTestRecord>,
      'jsonbDirectRelation' | 'jsonbDirectNullableRelation'
    >
  >,
];
