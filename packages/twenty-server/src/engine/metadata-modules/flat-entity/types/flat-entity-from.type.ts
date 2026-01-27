import { type AddSuffixToEntityOneToManyProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-one-to-many-properties.type';
import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { UniversalFlatEntityExtraProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export type SyncableFlatEntity = Omit<
  SyncableEntity,
  'application' | 'workspace'
> & {
  id: string;
};

export type FlatEntityFrom<
  TEntity extends SyncableEntity,
  TMetadataName extends
    AllMetadataName = FromMetadataEntityToMetadataName<TEntity>,
> = Omit<
  TEntity,
  | ExtractEntityRelatedEntityProperties<TEntity>
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> &
  AddSuffixToEntityOneToManyProperties<TEntity, 'ids'> & {
    /**
     * /!\ Under migration the idea is at some point to replace FlatEntity by UniversalFlatEntity /!\
     * Please avoid any usage or contact me ( prastoin ) before doing so
     * TODO remove with FlatEntity once it has been fully migrated
     */
    __universal?: UniversalFlatEntityExtraProperties<TEntity, TMetadataName>;
  };
