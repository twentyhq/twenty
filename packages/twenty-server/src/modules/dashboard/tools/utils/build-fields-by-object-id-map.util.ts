import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildFieldsByObjectIdMap = (fields: FlatFieldMetadata[]) => {
  const map = new Map<string, FlatFieldMetadata[]>();

  fields.forEach((field) => {
    const existing = map.get(field.objectMetadataId) ?? [];

    existing.push(field);
    map.set(field.objectMetadataId, existing);
  });

  return map;
};
