import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

/**
 * Currently under migration but aims to replace FlatEntity afterwards
 */
export type FlatEntityFromV2<
  TEntity,
  TMetadataName extends AllMetadataName | undefined = undefined,
  TInnerFlatEntity extends { __universal?: unknown } = FlatEntityFrom<
    TEntity,
    TMetadataName
  >,
> = Omit<TInnerFlatEntity, '__universal'> & TInnerFlatEntity['__universal'];
