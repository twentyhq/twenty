import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type BaseFlatObjectMetadata = FlatEntityFrom<
  Omit<ObjectMetadataEntity, 'targetRelationFields' | 'dataSourceId'>
>;
export type FlatObjectMetadata = BaseFlatObjectMetadata & {
  // NOTE: below fields are not reflected on the final UniversalFlatEntity either they should we should define a common source
  // TODO remove once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  imageIdentifierFieldMetadataUniversalIdentifier: string | null;
};
