import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataMapItem } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { capitalize } from 'src/utils/capitalize';

export function formatData<T>(
  data: T,
  objectMetadata: ObjectMetadataMapItem,
): T {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => formatData(item, objectMetadata)) as T;
  }

  const newData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const fieldMetadata = objectMetadata.fields[key];

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
  if (fieldMetadata.type === FieldMetadataType.RAW_JSON) {
    return JSON.parse(value as string);
  }

  return value;
}
