import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type BaseFlatObjectMetadata = FlatEntityFrom<
  Omit<ObjectMetadataEntity, 'targetRelationFields' | 'dataSourceId'>,
  'objectMetadata'
>;
export type FlatObjectMetadata = Omit<BaseFlatObjectMetadata, '__universal'> & {
  __universal?: BaseFlatObjectMetadata['__universal'] & {
    // TODO remove once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
    labelIdentifierFieldMetadataUniversalIdentifier: string | null;
    imageIdentifierFieldMetadataUniversalIdentifier: string | null;
  };
};
