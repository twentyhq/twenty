import { type FLAT_FIELD_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-jsonb-properties.constant';

export type FlatFieldMetadataEntityJsonbProperties =
  (typeof FLAT_FIELD_METADATA_JSONB_PROPERTIES)[number];
