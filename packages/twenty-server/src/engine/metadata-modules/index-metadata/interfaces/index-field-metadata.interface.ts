import { type IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export interface IndexFieldMetadataInterface {
  id: string;
  indexMetadataId: string;
  fieldMetadataId: string;
  fieldMetadata: FieldMetadataEntity;
  indexMetadata: IndexMetadataInterface;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
