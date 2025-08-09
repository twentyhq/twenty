import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const fieldMetadataId =
      objectMetadataItemWithFieldMaps.fieldIdByName[key] ||
      objectMetadataItemWithFieldMaps.fieldIdByJoinColumnName[key];

    const fieldMetadata =
      objectMetadataItemWithFieldMaps.fieldsById[fieldMetadataId];

    if (!fieldMetadata) {
      throw new Error(
        `Field metadata for field "${key}" is missing in object metadata ${objectMetadataItemWithFieldMaps.nameSingular}`,
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

export function formatCompositeField(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  fieldMetadata: FieldMetadataEntity,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  const compositeType = compositeTypeDefinitions.get(
    fieldMetadata.type as CompositeFieldMetadataType,
  );

  if (!compositeType) {
    throw new Error(
      `Composite type definition not found for type: ${fieldMetadata.type}`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedCompositeField: Record<string, any> = {};

  for (const property of compositeType.properties) {
    const subFieldKey = property.name;
    const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

    if (value && value[subFieldKey] !== undefined) {
      formattedCompositeField[fullFieldName] = formatFieldMetadataValue(
        value[subFieldKey],
        property as unknown as FieldMetadataEntity,
      );
    }
  }

  return formattedCompositeField;
}

function formatFieldMetadataValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  fieldMetadata: FieldMetadataEntity,
) {
  if (
    fieldMetadata.type === FieldMetadataType.RAW_JSON &&
    typeof value === 'string'
  ) {
    return JSON.parse(value as string);
  }

  return value;
}
