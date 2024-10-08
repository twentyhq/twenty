import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  ObjectMetadataMap,
  ObjectMetadataMapItem,
} from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { computeRelationType } from 'src/engine/twenty-orm/utils/compute-relation-type.util';
import { getCompositeFieldMetadataCollection } from 'src/engine/twenty-orm/utils/get-composite-field-metadata-collection';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export function formatResult<T>(
  data: T,
  objectMetadata: ObjectMetadataMapItem,
  objectMetadataMap: ObjectMetadataMap,
): T {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      formatResult(item, objectMetadata, objectMetadataMap),
    ) as T;
  }

  if (!isPlainObject(data)) {
    return data;
  }

  if (!objectMetadata) {
    throw new Error('Object metadata is missing');
  }

  const compositeFieldMetadataCollection =
    getCompositeFieldMetadataCollection(objectMetadata);

  const compositeFieldMetadataMap = new Map(
    compositeFieldMetadataCollection.flatMap((fieldMetadata) => {
      const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

      if (!compositeType) return [];

      // Map each composite property to a [key, value] pair
      return compositeType.properties.map((compositeProperty) => [
        computeCompositeColumnName(fieldMetadata.name, compositeProperty),
        {
          parentField: fieldMetadata.name,
          ...compositeProperty,
        },
      ]);
    }),
  );

  const relationMetadataMap = new Map(
    Object.values(objectMetadata.fields)
      .filter(({ type }) => isRelationFieldMetadataType(type))
      .map((fieldMetadata) => [
        fieldMetadata.name,
        {
          relationMetadata:
            fieldMetadata.fromRelationMetadata ??
            fieldMetadata.toRelationMetadata,
          relationType: computeRelationType(
            fieldMetadata,
            fieldMetadata.fromRelationMetadata ??
              (fieldMetadata.toRelationMetadata as RelationMetadataEntity),
          ),
        },
      ]),
  );
  const newData: object = {};

  for (const [key, value] of Object.entries(data)) {
    const compositePropertyArgs = compositeFieldMetadataMap.get(key);
    const { relationMetadata, relationType } =
      relationMetadataMap.get(key) ?? {};

    if (!compositePropertyArgs && !relationMetadata) {
      if (isPlainObject(value)) {
        newData[key] = formatResult(value, objectMetadata, objectMetadataMap);
      } else if (objectMetadata.fields[key]) {
        newData[key] = formatFieldMetadataValue(
          value,
          objectMetadata.fields[key],
        );
      } else {
        newData[key] = value;
      }

      continue;
    }

    if (relationMetadata) {
      const toObjectMetadata =
        objectMetadataMap[relationMetadata.toObjectMetadataId];

      const fromObjectMetadata =
        objectMetadataMap[relationMetadata.fromObjectMetadataId];

      if (!toObjectMetadata) {
        throw new Error(
          `Object metadata for object metadataId "${relationMetadata.toObjectMetadataId}" is missing`,
        );
      }

      if (!fromObjectMetadata) {
        throw new Error(
          `Object metadata for object metadataId "${relationMetadata.fromObjectMetadataId}" is missing`,
        );
      }

      newData[key] = formatResult(
        value,
        relationType === 'one-to-many' ? toObjectMetadata : fromObjectMetadata,
        objectMetadataMap,
      );
      continue;
    }

    if (!compositePropertyArgs) {
      continue;
    }

    const { parentField, ...compositeProperty } = compositePropertyArgs;

    if (!newData[parentField]) {
      newData[parentField] = {};
    }

    newData[parentField][compositeProperty.name] = value;
  }

  return newData as T;
}

function formatFieldMetadataValue(
  value: any,
  fieldMetadata: FieldMetadataInterface,
) {
  if (
    typeof value === 'string' &&
    (fieldMetadata.type === FieldMetadataType.MULTI_SELECT ||
      fieldMetadata.type === FieldMetadataType.ARRAY)
  ) {
    return value.replace(/{|}/g, '').split(',');
  }

  return value;
}
