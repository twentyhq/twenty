import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type EntityOverrides } from 'src/engine/metadata-modules/utils/entity-overrides.type';

export type FieldMetadataOverrides = EntityOverrides<
  FieldMetadataEntity,
  'fieldMetadata'
>;
