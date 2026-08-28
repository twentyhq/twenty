import { type Expect } from 'twenty-shared/testing';

import {
  type ManyToOneTargetNames,
  type OneToManyChildNames,
} from 'src/engine/workspace-cache/types/flat-entity-rows-requirement.type';

type IsNotNever<TValue> = [TValue] extends [never] ? false : true;

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<IsNotNever<OneToManyChildNames<'objectMetadata'>>>,
  Expect<IsNotNever<ManyToOneTargetNames<'fieldMetadata'>>>,
];
