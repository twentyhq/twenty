import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getCompositeFieldMetadataCollection } from 'src/engine/twenty-orm/utils/get-composite-field-metadata-collection';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { isDate } from 'src/utils/date/isDate';
import { isValidDate } from 'src/utils/date/isValidDate';
export function formatResult<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps | undefined,
  objectMetadataMaps: ObjectMetadataMaps,
): T {
  if (!isDefined(data)) {
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

  const compositeFieldMetadataMap = getCompositeFieldMetadataMap(
    objectMetadataItemWithFieldMaps,
  );

  const newData: object = {};

  for (const [key, value] of Object.entries(data)) {
    const compositePropertyArgs = compositeFieldMetadataMap.get(key);

    const fieldMetadataId = objectMetadataItemWithFieldMaps.fieldIdByName[key];

    const fieldMetadata = objectMetadataItemWithFieldMaps.fieldsById[
      fieldMetadataId
    ] as FieldMetadataEntity<FieldMetadataType> | undefined;

    const isRelation = fieldMetadata
      ? isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION)
      : false;

    if (!compositePropertyArgs && !isRelation) {
      if (isPlainObject(value)) {
        // @ts-expect-error legacy noImplicitAny
        newData[key] = formatResult(
          value,
          objectMetadataItemWithFieldMaps,
          objectMetadataMaps,
        );
      } else if (fieldMetadata) {
        // @ts-expect-error legacy noImplicitAny
        newData[key] = formatFieldMetadataValue(value, fieldMetadata);
      } else {
        // @ts-expect-error legacy noImplicitAny
        newData[key] = value;
      }

      continue;
    }

    if (isRelation) {
      if (!isDefined(fieldMetadata?.relationTargetObjectMetadataId)) {
        throw new Error(
          `Relation target object metadata ID is missing for field "${key}"`,
        );
      }

      const targetObjectMetadata =
        objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

      if (!targetObjectMetadata) {
        throw new Error(
          `Object metadata for object metadataId "${fieldMetadata.relationTargetObjectMetadataId}" is missing`,
        );
      }

      // @ts-expect-error legacy noImplicitAny
      newData[key] = formatResult(
        value,
        targetObjectMetadata,
        objectMetadataMaps,
      );
    }

    if (!compositePropertyArgs) {
      continue;
    }

    const { parentField, ...compositeProperty } = compositePropertyArgs;

    // @ts-expect-error legacy noImplicitAny
    if (!newData[parentField]) {
      // @ts-expect-error legacy noImplicitAny
      newData[parentField] = {};
    }

    // @ts-expect-error legacy noImplicitAny
    newData[parentField][compositeProperty.name] = value;
  }

  const dateFieldMetadataCollection = Object.values(
    objectMetadataItemWithFieldMaps.fieldsById,
  ).filter((field) => field.type === FieldMetadataType.DATE);

  // This is a temporary fix to handle a bug in the frontend where the date gets returned in the wrong timezone,
  //   thus returning the wrong date.
  // In short, for example :
  //   - DB stores `2025-01-01`
  //   - TypeORM .returning() returns `2024-12-31T23:00:00.000Z`
  //   - we shift +1h (or whatever the timezone offset is on the server)
  //   - we return `2025-01-01T00:00:00.000Z`
  // See this PR for more details: https://github.com/twentyhq/twenty/pull/9700
  const serverOffsetInMillisecondsToCounterActTypeORMAutomaticTimezoneShift =
    new Date().getTimezoneOffset() * 60 * 1000;

  for (const dateFieldMetadata of dateFieldMetadataCollection) {
    // @ts-expect-error legacy noImplicitAny
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

        // @ts-expect-error legacy noImplicitAny
        newData[dateFieldMetadata.name] = shiftedDate;
      }
    } else if (isNonEmptyString(rawUpdatedDate)) {
      // @ts-expect-error legacy noImplicitAny
      const currentDate = new Date(newData[dateFieldMetadata.name]);

      const shiftedDate = new Date(
        new Date(currentDate).getTime() -
          serverOffsetInMillisecondsToCounterActTypeORMAutomaticTimezoneShift,
      );

      // @ts-expect-error legacy noImplicitAny
      newData[dateFieldMetadata.name] = shiftedDate;
    }
  }

  return newData as T;
}

export function getCompositeFieldMetadataMap(
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) {
  const compositeFieldMetadataCollection = getCompositeFieldMetadataCollection(
    objectMetadataItemWithFieldMaps,
  );

  return new Map(
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
}

function formatFieldMetadataValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  fieldMetadata: FieldMetadataEntity,
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
