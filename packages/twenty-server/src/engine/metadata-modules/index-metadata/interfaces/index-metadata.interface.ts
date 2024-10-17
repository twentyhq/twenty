import { IndexFieldMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-field-metadata.interface';

export interface IndexMetadataInterface {
  name: string;
  isUnique: boolean;
  indexFieldMetadatas: IndexFieldMetadataInterface[];
}
