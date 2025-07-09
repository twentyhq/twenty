import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-field-metadata';
import { FlattenIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-index-metadata';

export type FlattenObjectMetadata = Partial<
  Omit<
    ObjectMetadataEntity,
    'fields' | 'indexMetadatas' | 'dataSource' | 'ObjectPermissions'
  >
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
