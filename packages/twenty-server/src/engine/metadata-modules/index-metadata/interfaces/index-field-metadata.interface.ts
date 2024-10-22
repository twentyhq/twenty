import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { IndexMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-metadata.interface';

export interface IndexFieldMetadataInterface {
  id: string;
  indexMetadataId: string;
  fieldMetadataId: string;
  fieldMetadata: FieldMetadataInterface;
  indexMetadata: IndexMetadataInterface;
  order: number;
}
