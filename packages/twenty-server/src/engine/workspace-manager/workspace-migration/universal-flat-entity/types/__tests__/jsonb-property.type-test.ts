import { type Equal, type Expect } from 'twenty-shared/testing';

import {
  type JSONB_PROPERTY_BRAND,
  type JsonbProperty,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObject = {};

type SimpleObject = { value: string };

type NestedObject = { nested: { deep: number } };

// eslint-disable-next-line unused-imports/no-unused-vars
type PrimitiveAssertions = [
  // Primitives pass through unchanged (not objects)
  Expect<Equal<JsonbProperty<string>, string>>,
  Expect<Equal<JsonbProperty<number>, number>>,
  Expect<Equal<JsonbProperty<boolean>, boolean>>,
  Expect<Equal<JsonbProperty<null>, null>>,
  Expect<Equal<JsonbProperty<undefined>, undefined>>,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type ObjectAssertions = [
  // Objects get branded
  Expect<
    Equal<
      JsonbProperty<SimpleObject>,
      SimpleObject & { [JSONB_PROPERTY_BRAND]?: never }
    >
  >,
  Expect<
    Equal<
      JsonbProperty<NestedObject>,
      NestedObject & { [JSONB_PROPERTY_BRAND]?: never }
    >
  >,
  Expect<
    Equal<
      JsonbProperty<EmptyObject>,
      EmptyObject & { [JSONB_PROPERTY_BRAND]?: never }
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
  // Arrays are objects, so they get branded on the array itself
  Expect<
    Equal<
      JsonbProperty<string[]>,
      string[] & { [JSONB_PROPERTY_BRAND]?: never }
    >
  >,
  Expect<
    Equal<
      JsonbProperty<number[]>,
      number[] & { [JSONB_PROPERTY_BRAND]?: never }
    >
  >,
  Expect<
    Equal<
      JsonbProperty<SimpleObject[]>,
      SimpleObject[] & { [JSONB_PROPERTY_BRAND]?: never }
    >
  >,
];

// eslint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  // Union of object and null: object gets branded, null passes through
  Expect<
    Equal<
      JsonbProperty<SimpleObject | null>,
      (SimpleObject & { [JSONB_PROPERTY_BRAND]?: never }) | null
    >
  >,

  // Union of objects: both get branded (distributive conditional)
  Expect<
    Equal<
      JsonbProperty<SimpleObject | NestedObject>,
      | (SimpleObject & { [JSONB_PROPERTY_BRAND]?: never })
      | (NestedObject & { [JSONB_PROPERTY_BRAND]?: never })
    >
  >,

  // Array in union: array gets branded
  Expect<
    Equal<
      JsonbProperty<SimpleObject[] | null>,
      (SimpleObject[] & { [JSONB_PROPERTY_BRAND]?: never }) | null
    >
  >,
];
