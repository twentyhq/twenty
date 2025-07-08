import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FlattenFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-field-metadata';
import { FlattenIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-index-metadata';

export type FlattenObjectMetadata = Partial<
  Omit<ObjectMetadataEntity, 'fields' | 'indexMetadatas'>
> & {
  uniqueIdentifier: string;
  flattenIndexMetadatas: FlattenIndexMetadata[];
  fieldInputs: FlattenFieldMetadata[];
};

export type FlattenedObjectMetdataWithoutFields = Omit<
  FlattenObjectMetadata,
  'fieldInputs'
>;
