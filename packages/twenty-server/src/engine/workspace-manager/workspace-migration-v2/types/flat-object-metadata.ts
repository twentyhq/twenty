import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlattenIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';

export type FlattenObjectMetadata = Partial<
  Omit<ObjectMetadataEntity, 'fields' | 'indexMetadatas'>
> & {
  uniqueIdentifier: string;
  flattenIndexMetadatas: FlattenIndexMetadata[];
  flattenFieldMetadatas: FlattenFieldMetadata[];
};

// Could be renamed
export type FlattenObjectMetadataWithoutFields = Omit<
  FlattenObjectMetadata,
  'flattenFieldMetadatas' | 'flattenIndexMetadatas'
>;
