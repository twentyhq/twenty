import { type FieldMetadataOptionRowForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';

export type FieldMetadataOptionEnumChange = {
  fromOptionRows: FieldMetadataOptionRowForOptions[];
  toOptionRows: FieldMetadataOptionRowForOptions[];
};

export type FieldMetadataOptionEnumChangeTracker = {
  // The field's own create or update action applies the change, so it can set the default value with it.
  hasFieldAction: (fieldMetadataUniversalIdentifier: string) => boolean;
  consume: (
    fieldMetadataUniversalIdentifier: string,
  ) => FieldMetadataOptionEnumChange | undefined;
};
