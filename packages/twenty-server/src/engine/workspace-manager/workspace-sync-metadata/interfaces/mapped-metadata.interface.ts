import { PartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { PartialObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type MappedFieldMetadata = Record<string, PartialFieldMetadata>;

export interface MappedObjectMetadata
  extends Omit<PartialObjectMetadata, 'fields'> {
  fields: MappedFieldMetadata;
}

export type MappedFieldMetadataEntity = Record<string, FieldMetadataEntity>;

export interface MappedObjectMetadataEntity
  extends Omit<ObjectMetadataEntity, 'fields'> {
  fields: MappedFieldMetadataEntity;
}
