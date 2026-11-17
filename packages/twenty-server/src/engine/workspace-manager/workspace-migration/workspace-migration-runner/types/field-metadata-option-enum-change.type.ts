import { type FieldMetadataOptionRowForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';

export type FieldMetadataOptionEnumChange = {
  fromOptionRows: FieldMetadataOptionRowForOptions[];
  toOptionRows: FieldMetadataOptionRowForOptions[];
};

export type FieldMetadataOptionEnumChangeOfMigration =
  FieldMetadataOptionEnumChange & { hasFieldAction: boolean };
