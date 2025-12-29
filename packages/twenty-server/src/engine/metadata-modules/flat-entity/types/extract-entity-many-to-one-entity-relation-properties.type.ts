import { MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { AllNonSyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/all-non-syncable-entities.type';
import { AllMetadataName } from 'twenty-shared/metadata';
import { Relation } from 'typeorm';

export type ExtractEntityManyToOneEntityRelationProperties<T> =
  NonNullable<
    {
      [P in keyof T]: NonNullable<T[P]> extends Relation<
        MetadataEntity<AllMetadataName> | AllNonSyncableEntity
      >
        ? P
        : never;
    }[keyof T]
  >;
