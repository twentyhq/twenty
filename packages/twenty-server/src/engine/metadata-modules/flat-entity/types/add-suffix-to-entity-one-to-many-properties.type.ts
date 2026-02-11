import { type RemoveSuffix } from 'twenty-shared/types';

import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

export type AddSuffixToEntityOneToManyProperties<
  TEntity,
  TSuffix extends string,
> = {
  [P in ExtractEntityOneToManyEntityRelationProperties<
    TEntity,
    SyncableEntity
  > &
    string as `${RemoveSuffix<P, 's'>}${Capitalize<TSuffix>}`]: string[];
};
