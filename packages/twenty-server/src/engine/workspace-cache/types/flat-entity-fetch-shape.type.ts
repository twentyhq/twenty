import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import {
  type CacheEntityFetchSpec,
  type CacheFetchableEntity,
  type CacheFetchableEntityName,
} from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';

type OneToManyChildNames<TMetadataName extends AllMetadataName> = {
  [TRelationProperty in keyof (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TMetadataName]]: (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TMetadataName][TRelationProperty] extends {
    metadataName: infer TChildMetadataName extends AllMetadataName;
  }
    ? TChildMetadataName
    : never;
}[keyof (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TMetadataName]];

type ManyToOneTargetNames<TMetadataName extends AllMetadataName> = {
  [TRelationProperty in keyof (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[TMetadataName]]: (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[TMetadataName][TRelationProperty] extends {
    metadataName: infer TTargetMetadataName extends AllMetadataName;
  }
    ? TTargetMetadataName
    : never;
}[keyof (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[TMetadataName]];

type RequiredFetchNames<TMetadataName extends AllMetadataName> =
  | TMetadataName
  | 'application'
  | OneToManyChildNames<TMetadataName>
  | ManyToOneTargetNames<TMetadataName>;

// Strict per-metadata-name variant of CacheEntityFetchShape: the own entity
// (full rows), every one-to-many child, every many-to-one target, and the
// application identity map are required by the relation constants; adding a
// relation there makes every provider missing the fetch fail to compile.
// Column-level requirements stay enforced by the fetch-requirements drift
// spec, where violations are reported by name.
// The own entity always needs full rows; groupBy stays allowed for
// self-referential relations (e.g. viewFilterGroup by parentViewFilterGroupId)
type OwnEntityFetchSpec<TName extends CacheFetchableEntityName> =
  | true
  | {
      columns: true;
      groupBy: readonly (keyof CacheFetchableEntity<TName> & string)[];
    };

export type FlatEntityFetchShape<TMetadataName extends AllMetadataName> = {
  [TName in TMetadataName]: OwnEntityFetchSpec<TName>;
} & {
  [TName in Exclude<
    RequiredFetchNames<TMetadataName>,
    TMetadataName
  >]: CacheEntityFetchSpec<TName>;
} & {
  [TName in Exclude<
    CacheFetchableEntityName,
    RequiredFetchNames<TMetadataName>
  >]?: CacheEntityFetchSpec<TName>;
};

// Fail-open canary: the derivations above walk the relation constants through
// `extends { metadataName: infer ... }` patterns that would silently collapse
// to never if the constants' value shape changed, turning FlatEntityFetchShape
// into an empty requirement while typecheck stays green. Anchoring on names
// known to carry relations makes such a refactor fail to compile here instead.
type Expect<TCondition extends true> = TCondition;
type IsNotNever<TValue> = [TValue] extends [never] ? false : true;

export type OneToManyDerivationCanary = Expect<
  IsNotNever<OneToManyChildNames<'objectMetadata'>>
>;
export type ManyToOneDerivationCanary = Expect<
  IsNotNever<ManyToOneTargetNames<'fieldMetadata'>>
>;
