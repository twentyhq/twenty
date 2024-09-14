import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export type FieldMetadataMap = Record<string, FieldMetadataInterface>;

export type ObjectMetadataMapItem = Omit<ObjectMetadataInterface, 'fields'> & {
  fields: FieldMetadataMap;
};

export type ObjectMetadataMap = Record<string, ObjectMetadataMapItem>;

export const generateObjectMetadataMap = (
  objectMetadataCollection: ObjectMetadataInterface[],
): ObjectMetadataMap => {
  const objectMetadataMap: ObjectMetadataMap = {};

  for (const objectMetadata of objectMetadataCollection) {
    const fieldsMap: FieldMetadataMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      fieldsMap[fieldMetadata.name] = fieldMetadata;
      fieldsMap[fieldMetadata.id] = fieldMetadata;
    }

    const processedObjectMetadata: ObjectMetadataMapItem = {
      ...objectMetadata,
      fields: fieldsMap,
    };

    objectMetadataMap[objectMetadata.id] = processedObjectMetadata;
    objectMetadataMap[objectMetadata.nameSingular] = processedObjectMetadata;
    objectMetadataMap[objectMetadata.namePlural] = processedObjectMetadata;
  }

  return objectMetadataMap;
};
