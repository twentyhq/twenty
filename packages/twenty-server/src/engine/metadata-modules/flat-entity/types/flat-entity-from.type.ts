import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AddSuffixToEntityOneToManyProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-one-to-many-properties.type';
import { type FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type UniversalFlatEntityExtraProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type SyncableFlatEntity = Omit<
  SyncableEntity,
  'application' | 'workspace'
> & {
  id: string;
};

export type FlatEntityFrom<
  TEntity,
  // Required to be passed for narrowed type
  TMetadataName extends AllMetadataName | undefined = undefined,
> = ScalarFlatEntity<TEntity> &
  AddSuffixToEntityOneToManyProperties<TEntity, 'ids'> &
  (TEntity extends SyncableEntity
    ? UniversalFlatEntityExtraProperties<
        TEntity,
        TMetadataName extends undefined
          ? FromMetadataEntityToMetadataName<TEntity>
          : TMetadataName
      > & { universalIdentifier: string }
    : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {});
