import { type Expect } from 'twenty-shared/testing';

import {
  type ManyToOneTargetNames,
  type OneToManyChildNames,
} from 'src/engine/workspace-cache/types/flat-entity-fetch-shape.type';

type IsNotNever<TValue> = [TValue] extends [never] ? false : true;

// Fail-open canaries: the FlatEntityFetchShape derivations walk the relation
// constants through `extends { metadataName: infer ... }` patterns that would
// silently collapse to never if the constants' value shape changed, turning
// the shape into an empty requirement while typecheck stays green. Anchoring
// on names known to carry relations makes such a refactor fail to compile
// here instead.
// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<IsNotNever<OneToManyChildNames<'objectMetadata'>>>,
  Expect<IsNotNever<ManyToOneTargetNames<'fieldMetadata'>>>,
];
