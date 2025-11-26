import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { isNull } from '@sniptt/guards';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE,
  DEFAULT_COMPOSITE_FIELDS_NULL_EQUIVALENT_VALUE,
  DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getCompositeFieldMetadataCollection } from 'src/engine/twenty-orm/utils/get-composite-field-metadata-collection';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

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

    const fieldMetadataId =
      objectMetadataItemWithFieldMaps.fieldIdByName[key] ||
      objectMetadataItemWithFieldMaps.fieldIdByName[
        compositePropertyArgs?.parentField ?? ''
      ];

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
        newData[key] = formatFieldMetadataValue(value, fieldMetadata.type);
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

    if (!compositePropertyArgs || !isDefined(fieldMetadata)) {
      continue;
    }

    const { parentField, ...compositeProperty } = compositePropertyArgs;

    // @ts-expect-error legacy noImplicitAny
    if (!newData[parentField]) {
      // @ts-expect-error legacy noImplicitAny
      newData[parentField] = {};
    }

    // @ts-expect-error legacy noImplicitAny
    newData[parentField][compositeProperty.name] = isNull(value)
      ? transformCompositeFieldNullValue(
          value,
          compositeProperty.name,
          fieldMetadata,
        )
      : value;
  }

  const fieldMetadataItemsOfTypeDateOnly = Object.values(
    objectMetadataItemWithFieldMaps.fieldsById,
  ).filter((field) => field.type === FieldMetadataType.DATE);

  for (const dateField of fieldMetadataItemsOfTypeDateOnly) {
    // @ts-expect-error legacy noImplicitAny
    const rawUpdatedDate = newData[dateField.name] as string | null | undefined;

    if (!isDefined(rawUpdatedDate)) {
      continue;
    }

    // @ts-expect-error legacy noImplicitAny
    newData[dateField.name] = rawUpdatedDate;
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
  fieldMetadataType: FieldMetadataType,
) {
  if (
    typeof value === 'string' &&
    (fieldMetadataType === FieldMetadataType.MULTI_SELECT ||
      fieldMetadataType === FieldMetadataType.ARRAY)
  ) {
    const cleanedValue = value.replace(/{|}/g, '').trim();

    return cleanedValue ? cleanedValue.split(',') : [];
  }

  if (isNull(value)) {
    if (
      fieldMetadataType === FieldMetadataType.MULTI_SELECT ||
      fieldMetadataType === FieldMetadataType.ARRAY
    ) {
      return DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE;
    }

    if (fieldMetadataType === FieldMetadataType.TEXT) {
      return DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE;
    }

    return value;
  }

  return value;
}

function transformCompositeFieldNullValue(
  value: unknown,
  compositePropertyName: string,
  fieldMetadata: FieldMetadataEntity,
) {
  if (!isNull(value)) return value;

  return (
    DEFAULT_COMPOSITE_FIELDS_NULL_EQUIVALENT_VALUE[fieldMetadata.type]?.[
      compositePropertyName
    ] ?? value
  );
}
