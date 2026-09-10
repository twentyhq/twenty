import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type EntityOverrides } from 'src/engine/metadata-modules/utils/entity-overrides.type';

// objectMetadata overrides are never converted to universal identifiers, so this
// one holds a plain field metadata id rather than a serialized relation.
// TODO remove once https://github.com/twentyhq/core-team-issues/issues/2172 has been resolved
export type ObjectMetadataOverrides = Omit<
  EntityOverrides<ObjectMetadataEntity, 'objectMetadata'>,
  'imageIdentifierFieldMetadataId'
> & {
  imageIdentifierFieldMetadataId?: string | null;
};
