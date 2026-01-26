import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type FlatObjectMetadata = FlatEntityFrom<
  Omit<ObjectMetadataEntity, 'targetRelationFields' | 'dataSourceId'>
>;
