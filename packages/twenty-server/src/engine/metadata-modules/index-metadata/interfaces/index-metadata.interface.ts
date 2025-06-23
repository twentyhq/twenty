import { IndexFieldMetadataInterface } from 'src/engine/metadata-modules/index-metadata/interfaces/index-field-metadata.interface';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export interface IndexMetadataInterface {
  id: string;
  name: string;
  isUnique: boolean;
  indexFieldMetadatas: IndexFieldMetadataInterface[];
  createdAt: Date;
  updatedAt: Date;
  indexWhereClause: string | null;
  indexType: IndexType;
}
