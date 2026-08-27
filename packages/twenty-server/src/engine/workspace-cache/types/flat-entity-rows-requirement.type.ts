import { type FindOptionsWhere } from 'typeorm';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type ALL_ONE_TO_MANY_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant';
import {
  type CacheFetchableEntity,
  type CacheFetchableEntityName,
  type EntityRowsRequirement,
  type GroupByColumns,
} from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

export type OneToManyChildNames<TMetadataName extends AllMetadataName> = {
  [TRelationProperty in keyof (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TMetadataName]]: (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TMetadataName][TRelationProperty] extends {
    metadataName: infer TChildMetadataName extends AllMetadataName;
  }
    ? TChildMetadataName
    : never;
}[keyof (typeof ALL_ONE_TO_MANY_METADATA_RELATIONS)[TMetadataName]];

export type ManyToOneTargetNames<TMetadataName extends AllMetadataName> = {
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

type OwnEntityRowsRequirement<TName extends CacheFetchableEntityName> =
  | true
  | {
      columns: true;
      groupBy?: GroupByColumns<TName>;
      where?: FindOptionsWhere<CacheFetchableEntity<TName>>;
    };

export type FlatEntityRowsRequirement<TMetadataName extends AllMetadataName> = {
  [TName in TMetadataName]: OwnEntityRowsRequirement<TName>;
} & {
  [TName in Exclude<
    RequiredFetchNames<TMetadataName>,
    TMetadataName
  >]: EntityRowsRequirement<TName>;
} & {
  [TName in Exclude<
    CacheFetchableEntityName,
    RequiredFetchNames<TMetadataName>
  >]?: EntityRowsRequirement<TName>;
};
