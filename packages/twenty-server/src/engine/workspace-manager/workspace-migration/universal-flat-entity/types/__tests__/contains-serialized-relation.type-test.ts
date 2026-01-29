import { type Equal, type Expect } from 'twenty-shared/testing';
import { type SerializedRelation } from 'twenty-shared/types';

import { type ContainsSerializedRelation } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/contains-serialized-relation.type';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObject = {};

// Basic type tests
// eslint-disable-next-line unused-imports/no-unused-vars
type BasicAssertions = [
  // SerializedRelation itself returns true
  Expect<Equal<ContainsSerializedRelation<SerializedRelation>, true>>,

  // Primitives return false
  Expect<Equal<ContainsSerializedRelation<string>, false>>,
  Expect<Equal<ContainsSerializedRelation<number>, false>>,
  Expect<Equal<ContainsSerializedRelation<boolean>, false>>,
  Expect<Equal<ContainsSerializedRelation<null>, false>>,
  Expect<Equal<ContainsSerializedRelation<undefined>, false>>,

  // Empty object returns false
  Expect<Equal<ContainsSerializedRelation<EmptyObject>, false>>,

  // Object with plain properties returns false
  Expect<
    Equal<ContainsSerializedRelation<{ name: string; count: number }>, false>
  >,

  // Object with SerializedRelation property returns true
  Expect<
    Equal<
      ContainsSerializedRelation<{ name: string; targetId: SerializedRelation }>,
      true
    >
  >,
];

// Nested object tests
// eslint-disable-next-line unused-imports/no-unused-vars
type NestedAssertions = [
  // Nested object with SerializedRelation returns true
  Expect<
    Equal<
      ContainsSerializedRelation<{
        outer: { inner: { relationId: SerializedRelation } };
      }>,
      true
    >
  >,

  // Deeply nested without SerializedRelation returns false
  Expect<
    Equal<
      ContainsSerializedRelation<{
        outer: { inner: { value: string } };
      }>,
      false
    >
  >,

  // Mixed nested with SerializedRelation returns true
  Expect<
    Equal<
      ContainsSerializedRelation<{
        name: string;
        nested: { targetId: SerializedRelation; description: string };
      }>,
      true
    >
  >,
];

// Array tests
// eslint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
  // Array of SerializedRelation returns true
  Expect<Equal<ContainsSerializedRelation<SerializedRelation[]>, true>>,

  // Array of objects with SerializedRelation returns true
  Expect<
    Equal<
      ContainsSerializedRelation<{ id: string; targetId: SerializedRelation }[]>,
      true
    >
  >,

  // Array of plain objects returns false
  Expect<
    Equal<
      ContainsSerializedRelation<{ name: string; count: number }[]>,
      false
    >
  >,

  // 2D array of SerializedRelation returns true
  Expect<Equal<ContainsSerializedRelation<SerializedRelation[][]>, true>>,

  // 2D array of strings returns false
  Expect<Equal<ContainsSerializedRelation<string[][]>, false>>,

  // 2D array of numbers returns false
  Expect<Equal<ContainsSerializedRelation<number[][]>, false>>,

  // Nested array of plain objects returns false
  Expect<
    Equal<ContainsSerializedRelation<{ x: number; y: number }[][]>, false>
  >,

  // Nested structure with array containing SerializedRelation returns true
  Expect<
    Equal<
      ContainsSerializedRelation<{
        items: { relationId: SerializedRelation }[];
      }>,
      true
    >
  >,
];

// Union type tests
// Note: ContainsSerializedRelation is distributive over unions, so it returns
// true | false (boolean) when some union members contain SerializedRelation and some don't.
// The consuming code uses `true extends ContainsSerializedRelation<T>` to check
// if ANY member contains a SerializedRelation.
// eslint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  // Union where one member has SerializedRelation, one doesn't -> boolean (distributive)
  // Usage: `true extends boolean` -> true (correct for "any member has relation")
  Expect<
    Equal<
      ContainsSerializedRelation<
        | { type: 'ref'; targetId: SerializedRelation }
        | { type: 'plain'; name: string }
      >,
      boolean
    >
  >,

  // Nullable SerializedRelation: property value is union, but object is not distributed
  Expect<
    Equal<
      ContainsSerializedRelation<{ targetId: SerializedRelation | null }>,
      true
    >
  >,

  // Union of plain types: all members return false -> false
  Expect<
    Equal<
      ContainsSerializedRelation<
        { type: 'a'; value: string } | { type: 'b'; count: number }
      >,
      false
    >
  >,

  // Object with optional SerializedRelation returns true
  Expect<
    Equal<
      ContainsSerializedRelation<{ name: string; targetId?: SerializedRelation }>,
      true
    >
  >,

  // SerializedRelation | null: SerializedRelation->true, null->false -> boolean
  Expect<Equal<ContainsSerializedRelation<SerializedRelation | null>, boolean>>,

  // string | number | null: all return false -> false
  Expect<Equal<ContainsSerializedRelation<string | number | null>, false>>,
];

// Complex real-world scenario tests
type WorkflowConfig = {
  steps: {
    stepId: string;
    assigneeId: SerializedRelation;
    action: string;
  }[];
};

type Metadata = {
  createdBy: {
    userId: SerializedRelation;
    timestamp: string;
  };
  modifiedBy: {
    userId: SerializedRelation;
    timestamp: string;
  } | null;
};

type DisplaySettings = {
  theme: 'light' | 'dark';
  fontSize: number;
};

// eslint-disable-next-line unused-imports/no-unused-vars
type RealWorldAssertions = [
  // Workflow config with nested relations returns true
  Expect<Equal<ContainsSerializedRelation<WorkflowConfig>, true>>,

  // Metadata with nested relations returns true
  Expect<Equal<ContainsSerializedRelation<Metadata>, true>>,

  // Display settings without relations returns false
  Expect<Equal<ContainsSerializedRelation<DisplaySettings>, false>>,
];
