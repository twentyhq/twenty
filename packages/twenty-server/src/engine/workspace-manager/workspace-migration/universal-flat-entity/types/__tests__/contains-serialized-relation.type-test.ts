import { type Equal, type Expect } from 'twenty-shared/testing';
import { type SerializedRelation } from 'twenty-shared/types';

import { type ContainsSerializedRelation } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/contains-serialized-relation.type';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObject = {};

// ContainsSerializedRelation checks for SerializedRelation in object properties
// It recurses into nested objects and arrays, but stops at primitives

// Direct property tests
// eslint-disable-next-line unused-imports/no-unused-vars
type DirectPropertyAssertions = [
  // Direct SerializedRelation property
  Expect<
    Equal<ContainsSerializedRelation<{ targetId: SerializedRelation }>, true>
  >,

  // Nullable SerializedRelation property
  Expect<
    Equal<
      ContainsSerializedRelation<{ targetId: SerializedRelation | null }>,
      true
    >
  >,

  // Optional SerializedRelation property
  Expect<
    Equal<ContainsSerializedRelation<{ targetId?: SerializedRelation }>, true>
  >,

  // Array of SerializedRelation
  Expect<
    Equal<ContainsSerializedRelation<{ ids: SerializedRelation[] }>, true>
  >,

  // Plain properties only - no SerializedRelation
  Expect<
    Equal<ContainsSerializedRelation<{ name: string; count: number }>, false>
  >,

  // Empty object
  Expect<Equal<ContainsSerializedRelation<EmptyObject>, false>>,
];

// Nested object tests - should recurse
// eslint-disable-next-line unused-imports/no-unused-vars
type NestedObjectAssertions = [
  // Nested object with SerializedRelation
  Expect<
    Equal<
      ContainsSerializedRelation<{
        nested: { targetId: SerializedRelation };
      }>,
      true
    >
  >,

  // Deeply nested SerializedRelation
  Expect<
    Equal<
      ContainsSerializedRelation<{
        level1: { level2: { level3: { id: SerializedRelation } } };
      }>,
      true
    >
  >,

  // Nested object without SerializedRelation
  Expect<
    Equal<
      ContainsSerializedRelation<{
        nested: { name: string; count: number };
      }>,
      false
    >
  >,
];

// Nested array tests - should recurse
// eslint-disable-next-line unused-imports/no-unused-vars
type NestedArrayAssertions = [
  // Array of objects with SerializedRelation
  Expect<
    Equal<
      ContainsSerializedRelation<{
        items: { targetId: SerializedRelation }[];
      }>,
      true
    >
  >,

  // 2D array of SerializedRelation
  Expect<
    Equal<ContainsSerializedRelation<{ matrix: SerializedRelation[][] }>, true>
  >,

  // Array of plain objects
  Expect<
    Equal<
      ContainsSerializedRelation<{
        items: { name: string }[];
      }>,
      false
    >
  >,

  // 2D array of strings
  Expect<Equal<ContainsSerializedRelation<{ matrix: string[][] }>, false>>,
];

// Primitive types - should return false (not objects)
// eslint-disable-next-line unused-imports/no-unused-vars
type PrimitiveAssertions = [
  Expect<Equal<ContainsSerializedRelation<string>, false>>,
  Expect<Equal<ContainsSerializedRelation<number>, false>>,
  Expect<Equal<ContainsSerializedRelation<boolean>, false>>,
  Expect<Equal<ContainsSerializedRelation<null>, false>>,
  Expect<Equal<ContainsSerializedRelation<undefined>, false>>,
];

// Real-world tests
// eslint-disable-next-line unused-imports/no-unused-vars
type RealWorldAssertions = [
  // Settings with SerializedRelation
  Expect<
    Equal<
      ContainsSerializedRelation<{
        relationType?: string;
        junctionTargetFieldId?: SerializedRelation;
      }>,
      true
    >
  >,

  // Workflow config with nested SerializedRelation in array
  Expect<
    Equal<
      ContainsSerializedRelation<{
        steps: { assigneeId: SerializedRelation; action: string }[];
      }>,
      true
    >
  >,
];
