import { capitalize, FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export function formatData<T>(
  data: T,
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
): T {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      formatData(item, objectMetadataItemWithFieldMaps),
    ) as T;
  }

  const newData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const fieldMetadata = objectMetadataItemWithFieldMaps.fieldsByName[key];

    if (!fieldMetadata) {
      throw new Error(
        `Field metadata for field "${key}" is missing in object metadata`,
      );
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const formattedCompositeField = formatCompositeField(
        value,
        fieldMetadata,
      );

      Object.assign(newData, formattedCompositeField);
    } else {
      newData[key] = formatFieldMetadataValue(value, fieldMetadata);
    }
  }

  return newData as T;
}

function formatCompositeField(
  value: any,
  fieldMetadata: FieldMetadataInterface,
): Record<string, any> {
  const compositeType = compositeTypeDefinitions.get(
    fieldMetadata.type as CompositeFieldMetadataType,
  );

  if (!compositeType) {
    throw new Error(
      `Composite type definition not found for type: ${fieldMetadata.type}`,
    );
  }

  const formattedCompositeField: Record<string, any> = {};

  for (const property of compositeType.properties) {
    const subFieldKey = property.name;
    const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

    if (value && value[subFieldKey] !== undefined) {
      formattedCompositeField[fullFieldName] = formatFieldMetadataValue(
        value[subFieldKey],
        property as unknown as FieldMetadataInterface,
      );
    }
  }

  return formattedCompositeField;
}

function formatFieldMetadataValue(
  value: any,
  fieldMetadata: FieldMetadataInterface,
) {
  if (
    fieldMetadata.type === FieldMetadataType.RAW_JSON &&
    typeof value === 'string'
  ) {
    return JSON.parse(value as string);
  }

  return value;
}
