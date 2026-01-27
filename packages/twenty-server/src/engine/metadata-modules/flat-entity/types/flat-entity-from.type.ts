import { AddSuffixToEntityManyToOneProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-many-to-one-properties.type';
import { type AddSuffixToEntityOneToManyProperties } from 'src/engine/metadata-modules/flat-entity/types/add-suffix-to-entity-one-to-many-properties.type';
import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { ExpandJsonbSerializedRelation } from 'src/engine/metadata-modules/flat-entity/types/expand-jsonb-serialized-relation.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type ExtractJsonbProperties } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/extract-jsonb-properties.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export type SyncableFlatEntity = Omit<
  SyncableEntity,
  'application' | 'workspace'
> & {
  id: string;
};

export type Prastoin<
  TEntity extends SyncableEntity,
  TMetadataName extends
    AllMetadataName = FromMetadataEntityToMetadataName<TEntity>,
> = AddSuffixToEntityOneToManyProperties<TEntity, 'universalIdentifiers'> &
  AddSuffixToEntityManyToOneProperties<
    TEntity,
    TMetadataName,
    'universalIdentifier'
  > & {
    applicationUniversalIdentifier: string;
  } & {
    [P in ExtractJsonbProperties<TEntity>]: ExpandJsonbSerializedRelation<
      TEntity[P]
    >;
  };

export type FlatEntityFrom<
  TEntity extends SyncableEntity,
  TMetadataName extends
    AllMetadataName = FromMetadataEntityToMetadataName<TEntity>,
> = Omit<
  TEntity,
  | ExtractEntityRelatedEntityProperties<TEntity>
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
  | ExtractJsonbProperties<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> &
  AddSuffixToEntityOneToManyProperties<TEntity, 'ids'> & {
    __universal?: Prastoin<TEntity, TMetadataName>;
  };
