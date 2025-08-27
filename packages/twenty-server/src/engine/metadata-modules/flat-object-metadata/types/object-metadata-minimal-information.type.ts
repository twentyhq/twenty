import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ObjectMetadataMinimalInformation = Partial<
  Pick<FlatObjectMetadata, 'id' | 'namePlural' | 'nameSingular'>
>;
