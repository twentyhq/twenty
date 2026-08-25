import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import { type KNOWN_FETCH_GAPS } from 'src/engine/workspace-cache/constants/known-fetch-gaps.constant';
import {
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

type KnownGapChildNames<TMetadataName extends AllMetadataName> =
  TMetadataName extends keyof typeof KNOWN_FETCH_GAPS
    ? (typeof KNOWN_FETCH_GAPS)[TMetadataName][number]
    : never;

type RequiredFetchNames<TMetadataName extends AllMetadataName> =
  | TMetadataName
  | 'application'
  | Exclude<
      OneToManyChildNames<TMetadataName> | ManyToOneTargetNames<TMetadataName>,
      KnownGapChildNames<TMetadataName>
    >;

type ColumnsOrFull<TName extends CacheFetchableEntityName> =
  | readonly (keyof CacheFetchableEntity<TName> & string)[]
  | true;

// Strict per-metadata-name variant of CacheEntityFetchShape: the own entity
// (full rows), every one-to-many child, every many-to-one target, and the
// application identity map are required by the relation constants; adding a
// relation there makes every provider missing the fetch fail to compile.
// Column-level requirements stay enforced by the fetch-requirements drift
// spec, where violations are reported by name.
export type FlatEntityFetchShape<TMetadataName extends AllMetadataName> = {
  [TName in TMetadataName]: true;
} & {
  [TName in Exclude<
    RequiredFetchNames<TMetadataName>,
    TMetadataName
  >]: ColumnsOrFull<TName>;
} & {
  [TName in Exclude<
    CacheFetchableEntityName,
    RequiredFetchNames<TMetadataName>
  >]?: ColumnsOrFull<TName>;
};
