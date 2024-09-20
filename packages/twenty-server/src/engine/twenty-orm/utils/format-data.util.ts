import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataMapItem } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { getCompositeFieldMetadataCollection } from 'src/engine/twenty-orm/utils/get-composite-field-metadata-collection';

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

  const compositeFieldMetadataCollection =
    getCompositeFieldMetadataCollection(objectMetadata);

  const compositeFieldMetadataMap = new Map(
    compositeFieldMetadataCollection.map((fieldMetadata) => [
      fieldMetadata.name,
      fieldMetadata,
    ]),
  );
  const newData: object = {};

  for (const [key, value] of Object.entries(data)) {
    const fieldMetadata = compositeFieldMetadataMap.get(key);

    if (!fieldMetadata) {
      if (isPlainObject(value)) {
        newData[key] = formatData(value, objectMetadata);
      } else {
        newData[key] = value;
      }
      continue;
    }

    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) {
      continue;
    }

    for (const compositeProperty of compositeType.properties) {
      const compositeKey = computeCompositeColumnName(
        fieldMetadata.name,
        compositeProperty,
      );
      const value = data?.[key]?.[compositeProperty.name];

      if (value === undefined || value === null) {
        continue;
      }

      newData[compositeKey] = data[key][compositeProperty.name];
    }
  }

  return newData as T;
}
