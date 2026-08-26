import { type Expect } from 'twenty-shared/testing';

import {
  type ManyToOneTargetNames,
  type OneToManyChildNames,
} from 'src/engine/workspace-cache/types/flat-entity-rows-requirement.type';

type IsNotNever<TValue> = [TValue] extends [never] ? false : true;

// Fail-open canaries: the FlatEntityRowsRequirement derivations walk the relation
// constants through `extends { metadataName: infer ... }` patterns that would
// silently collapse to never if the constants' value shape changed, turning
// the requirement into an empty one while typecheck stays green. Anchoring
// on names known to carry relations makes such a refactor fail to compile
// here instead.
// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<IsNotNever<OneToManyChildNames<'objectMetadata'>>>,
  Expect<IsNotNever<ManyToOneTargetNames<'fieldMetadata'>>>,
];
