import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';

export type FlatObjectMetadata = Partial<
  Omit<ObjectMetadataEntity, 'fields' | 'indexMetadatas'>
> & {
  uniqueIdentifier: string;
  flatIndexMetadatas: FlatIndexMetadata[];
  flatFieldMetadatas: FlatFieldMetadata[];
};

// Could be renamed
export type FlatObjectMetadataWithoutFields = Omit<
  FlatObjectMetadata,
  'flatFieldMetadatas' | 'flatIndexMetadatas'
>;
