import { type Equal, type Expect } from 'twenty-shared/testing';
import { type EmptyObject } from 'twenty-shared/types';

import {
  type JSONB_PROPERTY_BRAND,
  type JsonbProperty,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

type SimpleObject = { value: string };

type NestedObject = { nested: { deep: number } };

// oxlint-disable-next-line unused-imports/no-unused-vars
type PrimitiveAssertions = [
  Expect<Equal<JsonbProperty<string>, string>>,
  Expect<Equal<JsonbProperty<number>, number>>,
  Expect<Equal<JsonbProperty<boolean>, boolean>>,
  Expect<Equal<JsonbProperty<null>, null>>,
  Expect<Equal<JsonbProperty<undefined>, undefined>>,
];

// oxlint-disable-next-line unused-imports/no-unused-vars
type ObjectAssertions = [
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

// oxlint-disable-next-line unused-imports/no-unused-vars
type ArrayAssertions = [
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

// oxlint-disable-next-line unused-imports/no-unused-vars
type UnionAssertions = [
  Expect<
    Equal<
      JsonbProperty<SimpleObject | null>,
      (SimpleObject & { [JSONB_PROPERTY_BRAND]?: never }) | null
    >
  >,

  Expect<
    Equal<
      JsonbProperty<SimpleObject | NestedObject>,
      | (SimpleObject & { [JSONB_PROPERTY_BRAND]?: never })
      | (NestedObject & { [JSONB_PROPERTY_BRAND]?: never })
    >
  >,

  Expect<
    Equal<
      JsonbProperty<SimpleObject[] | null>,
      (SimpleObject[] & { [JSONB_PROPERTY_BRAND]?: never }) | null
    >
  >,
];
