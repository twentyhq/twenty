import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

export type PartialIndexMetadata = Omit<
  IndexMetadataEntity,
  | 'id'
  | 'objectMetadata'
  | 'indexFieldMetadatas'
  | 'createdAt'
  | 'updatedAt'
  | 'universalIdentifier'
  | 'application'
  | 'applicationId'
  | 'workspace'
> & {
  columns: string[];
};
