import { type fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';

export type FieldMetadataColumnType = ReturnType<
  typeof fieldMetadataTypeToColumnType
>;
