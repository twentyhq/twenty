import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const FLAT_FIELD_METADATA_RELATION_EDITABLE_PROPERTIES_ON_SIBLING_MORPH_OR_RELATION_UPDATE_CONSTANT =
  ['isActive'] as const satisfies (keyof FlatFieldMetadata)[];
