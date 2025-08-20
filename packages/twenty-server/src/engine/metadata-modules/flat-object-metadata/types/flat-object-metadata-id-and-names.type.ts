import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FlatObjectMetadataIdAndNames = Partial<
  Pick<FlatObjectMetadata, 'id' | 'namePlural' | 'nameSingular'>
>;
