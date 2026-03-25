import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatObjectMetadata = UniversalFlatEntityFrom<
  Omit<
    ObjectMetadataEntity,
    | 'dataSourceId'
    | 'labelIdentifierFieldMetadataId'
    | 'imageIdentifierFieldMetadataId'
  >,
  'objectMetadata'
> & {
  // NOTE: below fields are not reflected on the final UniversalFlatEntity either they should we should define a common source
  // TODO remove once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  imageIdentifierFieldMetadataUniversalIdentifier: string | null;
};
