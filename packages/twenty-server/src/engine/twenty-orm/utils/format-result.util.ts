import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { computeRelationType } from 'src/engine/twenty-orm/utils/compute-relation-type.util';
import { getCompositeFieldMetadataCollection } from 'src/engine/twenty-orm/utils/get-composite-field-metadata-collection';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { isDate } from 'src/utils/date/isDate';
import { isValidDate } from 'src/utils/date/isValidDate';

export function formatResult<T>(
  data: any,
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  objectMetadataMaps: ObjectMetadataMaps,
): T {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      formatResult(item, objectMetadataItemWithFieldMaps, objectMetadataMaps),
    ) as T;
  }

  if (!isPlainObject(data)) {
    return data;
  }

  if (!objectMetadataItemWithFieldMaps) {
    throw new Error('Object metadata is missing');
  }

  const compositeFieldMetadataCollection = getCompositeFieldMetadataCollection(
    objectMetadataItemWithFieldMaps,
  );

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
    Object.values(objectMetadataItemWithFieldMaps.fieldsById)
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
  const objectMetadaItemFieldsByName =
    objectMetadataMaps.byId[objectMetadataItemWithFieldMaps.id]?.fieldsByName;

  for (const [key, value] of Object.entries(data)) {
    const compositePropertyArgs = compositeFieldMetadataMap.get(key);
    const { relationMetadata, relationType } =
      relationMetadataMap.get(key) ?? {};

    if (!compositePropertyArgs && !relationMetadata) {
      if (isPlainObject(value)) {
        newData[key] = formatResult(
          value,
          objectMetadataItemWithFieldMaps,
          objectMetadataMaps,
        );
      } else if (objectMetadaItemFieldsByName[key]) {
        newData[key] = formatFieldMetadataValue(
          value,
          objectMetadaItemFieldsByName[key],
        );
      } else {
        newData[key] = value;
      }

      continue;
    }

    if (relationMetadata) {
      const toObjectMetadata =
        objectMetadataMaps.byId[relationMetadata.toObjectMetadataId];

      const fromObjectMetadata =
        objectMetadataMaps.byId[relationMetadata.fromObjectMetadataId];

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
        objectMetadataMaps,
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

  const dateFieldMetadataCollection =
    objectMetadataItemWithFieldMaps.fields.filter(
      (field) => field.type === FieldMetadataType.DATE,
    );

  // This is a temporary fix to handle a bug in the frontend where the date gets returned in the wrong timezone,
  //   thus returning the wrong date.
  //
  // In short, for example :
  //   - DB stores `2025-01-01`
  //   - TypeORM .returning() returns `2024-12-31T23:00:00.000Z`
  //   - we shift +1h (or whatever the timezone offset is on the server)
  //   - we return `2025-01-01T00:00:00.000Z`
  //
  // See this PR for more details: https://github.com/twentyhq/twenty/pull/9700
  const serverOffsetInMillisecondsToCounterActTypeORMAutomaticTimezoneShift =
    new Date().getTimezoneOffset() * 60 * 1000;

  for (const dateFieldMetadata of dateFieldMetadataCollection) {
    const rawUpdatedDate = newData[dateFieldMetadata.name] as
      | string
      | null
      | undefined
      | Date;

    if (!isDefined(rawUpdatedDate)) {
      continue;
    }

    if (isDate(rawUpdatedDate)) {
      if (isValidDate(rawUpdatedDate)) {
        const shiftedDate = new Date(
          rawUpdatedDate.getTime() -
            serverOffsetInMillisecondsToCounterActTypeORMAutomaticTimezoneShift,
        );

        newData[dateFieldMetadata.name] = shiftedDate;
      }
    } else if (isNonEmptyString(rawUpdatedDate)) {
      const currentDate = new Date(newData[dateFieldMetadata.name]);

      const shiftedDate = new Date(
        new Date(currentDate).getTime() -
          serverOffsetInMillisecondsToCounterActTypeORMAutomaticTimezoneShift,
      );

      newData[dateFieldMetadata.name] = shiftedDate;
    }
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
    const cleanedValue = value.replace(/{|}/g, '').trim();

    return cleanedValue ? cleanedValue.split(',') : [];
  }

  return value;
}
