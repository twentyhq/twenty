import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';
import { MetadataEntitesRelationTarget } from 'src/engine/workspace-manager/workspace-migration-v2/types/metadata-entities-relation-targets.type';
import { FieldMetadataType } from 'twenty-shared/types';

type FieldMetadataEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<
    FieldMetadataEntity,
    MetadataEntitesRelationTarget
  >;

export type FlatFieldMetadata<T extends FieldMetadataType = FieldMetadataType> =
  Partial<
    Omit<FieldMetadataEntity<T>, FieldMetadataEntityRelationProperties>
  > & {
    uniqueIdentifier: string;
  };
