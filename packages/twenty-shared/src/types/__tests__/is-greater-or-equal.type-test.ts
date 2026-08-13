import { type Equal, type Expect } from '@/testing';

import { type IsGreaterOrEqual } from '@/types/IsGreaterOrEqual.type';

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<Equal<IsGreaterOrEqual<0, 0>, true>>,
  Expect<Equal<IsGreaterOrEqual<3, 3>, true>>,

  Expect<Equal<IsGreaterOrEqual<3, 0>, true>>,
  Expect<Equal<IsGreaterOrEqual<3, 2>, true>>,
  Expect<Equal<IsGreaterOrEqual<1, 0>, true>>,

  Expect<Equal<IsGreaterOrEqual<0, 1>, false>>,
  Expect<Equal<IsGreaterOrEqual<0, 3>, false>>,
  Expect<Equal<IsGreaterOrEqual<2, 3>, false>>,
];
