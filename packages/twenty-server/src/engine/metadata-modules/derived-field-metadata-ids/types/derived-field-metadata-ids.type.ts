import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type DerivedFieldMetadataIds = {
  uniqueFieldMetadataIds: ReadonlySet<string>;
  searchableFieldMetadataIds: ReadonlySet<string>;
  // Options live in fieldMetadataOption rows, so an entity read from the repository gets them from here
  optionsByFieldMetadataId: ReadonlyMap<string, FieldMetadataEntity['options']>;
};
