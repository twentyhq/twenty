import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsForObject } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-for-object.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export function formatData<T>(
  data: T,
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): T {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      formatData(item, flatObjectMetadata, flatFieldMetadataMaps),
    ) as T;
  }

  const { fieldIdByName, fieldIdByJoinColumnName } = buildFieldMapsForObject(
    flatFieldMetadataMaps,
    flatObjectMetadata.id,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const fieldMetadataId = fieldIdByName[key] || fieldIdByJoinColumnName[key];

    const fieldMetadata = flatFieldMetadataMaps.byId[fieldMetadataId];

    if (!fieldMetadata) {
      throw new Error(
        `Field metadata for field "${key}" is missing in object metadata ${flatObjectMetadata.nameSingular}`,
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
  fieldMetadata: FlatFieldMetadata,
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
        property as unknown as FlatFieldMetadata,
      );
    }
  }

  return formattedCompositeField;
}

function formatFieldMetadataValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  fieldMetadata: FlatFieldMetadata,
) {
  if (
    fieldMetadata.type === FieldMetadataType.RAW_JSON &&
    typeof value === 'string'
  ) {
    return JSON.parse(value as string);
  }

  return value;
}
