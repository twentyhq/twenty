import { type FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';

export type FlatFieldMetadataEditableProperties =
  (typeof FLAT_FIELD_METADATA_EDITABLE_PROPERTIES.custom)[number];
