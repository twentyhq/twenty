import { FlatIndexFieldMetadata } from "src/engine/workspace-manager/workspace-migration-v2/types/flat-index-field-metadata";

export const FLAT_INDEX_FIELD_METADATA_PROPERTIES_TO_COMPARE = [
  'fieldMetadataId',
  'indexMetadataId',
  'order',
] as const satisfies (keyof FlatIndexFieldMetadata)[];
