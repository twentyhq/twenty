import { type Equal, type Expect } from '@/testing';

import { type IndexOf } from '@/types/IndexOf.type';

type Versions = readonly ['1.20.0', '1.21.0', '1.22.0', '1.23.0'];

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<Equal<IndexOf<'1.20.0', Versions>, 0>>,
  Expect<Equal<IndexOf<'1.21.0', Versions>, 1>>,
  Expect<Equal<IndexOf<'1.22.0', Versions>, 2>>,
  Expect<Equal<IndexOf<'1.23.0', Versions>, 3>>,

  // Not found resolves to never
  Expect<Equal<IndexOf<'1.99.0', Versions>, never>>,

  // Single element tuple
  Expect<Equal<IndexOf<'a', readonly ['a']>, 0>>,

  // Empty tuple
  Expect<Equal<IndexOf<'a', readonly []>, never>>,
];
