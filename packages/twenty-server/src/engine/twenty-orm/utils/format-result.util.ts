import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { isNull } from '@sniptt/guards';
import {
  FieldActorSource,
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined, stringifySafely } from 'twenty-shared/utils';

import {
  DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE,
  DEFAULT_COMPOSITE_FIELDS_NULL_EQUIVALENT_VALUE,
  DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  buildFieldMapsFromFlatObjectMetadata,
  type FieldMapsForObject,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { formatCompositeFieldValue } from 'src/engine/twenty-orm/utils/format-composite-field-value.util';
import { getCompositeFieldMetadataCollection } from 'src/engine/twenty-orm/utils/get-composite-field-metadata-collection';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type CompositeFieldMetadataWithRequiredProperties = {
  fieldMetadata: FlatFieldMetadata;
  requiredPropertyNames: string[];
};

type FormatResultObjectCache = {
  fieldMaps: FieldMapsForObject;
  compositeFieldMetadataMap: ReturnType<
    typeof getCompositeFieldMetadataMapFromCollection
  >;
  compositeFieldMetadataWithRequiredProperties: CompositeFieldMetadataWithRequiredProperties[];
  dateTimeFieldMetadataItems: FlatFieldMetadata[];
};

type FormatResultCache = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectCacheByObjectMetadataId: Map<string, FormatResultObjectCache>;
};

export function formatResult<T>(
  // oxlint-disable-next-line typescript/no-explicit-any
  data: any,
  flatObjectMetadata: FlatObjectMetadata | undefined,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  fieldMapsForObject?: FieldMapsForObject,
): T {
  return formatResultRecursively(
    data,
    flatObjectMetadata,
    {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectCacheByObjectMetadataId: new Map(),
    },
    fieldMapsForObject,
  );
}

function formatResultRecursively<T>(
  // oxlint-disable-next-line typescript/no-explicit-any
  data: any,
  flatObjectMetadata: FlatObjectMetadata | undefined,
  cache: FormatResultCache,
  fieldMapsForObject?: FieldMapsForObject,
): T {
  if (!isDefined(data)) {
    return data;
  }

  if (!isPlainObject(data)) {
    if (Array.isArray(data)) {
      return data.map((item) =>
        formatResultRecursively(
          item,
          flatObjectMetadata,
          cache,
          fieldMapsForObject,
        ),
      ) as T;
    }

    return data;
  }

  if (!flatObjectMetadata) {
    throw new Error('Object metadata is missing');
  }

  const objectCache = getOrCreateFormatResultObjectCache({
    cache,
    flatObjectMetadata,
    fieldMapsForObject,
  });

  const { fieldIdByName, fieldIdByJoinColumnName } = objectCache.fieldMaps;

  const newData: object = {};

  for (const [key, value] of Object.entries(data)) {
    const compositePropertyArgs =
      objectCache.compositeFieldMetadataMap.get(key);

    const fieldMetadataId =
      fieldIdByName[key] ||
      fieldIdByJoinColumnName[key] ||
      fieldIdByName[compositePropertyArgs?.parentField ?? ''];

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: cache.flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      continue;
    }

    const isRelation = fieldMetadata
      ? isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION)
      : false;

    if (isRelation) {
      if (!isDefined(fieldMetadata?.relationTargetObjectMetadataId)) {
        throw new Error(
          `Relation target object metadata ID is missing for field "${key}"`,
        );
      }

      const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: cache.flatObjectMetadataMaps,
      });

      if (!targetObjectMetadata) {
        throw new Error(
          `Object metadata for object metadataId "${fieldMetadata.relationTargetObjectMetadataId}" is missing`,
        );
      }

      // @ts-expect-error legacy noImplicitAny
      newData[key] = formatResultRecursively(
        value,
        targetObjectMetadata,
        cache,
      );
      continue;
    }

    if (isDefined(compositePropertyArgs)) {
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
        : formatCompositeFieldValue(
            value,
            compositeProperty.name,
            fieldMetadata,
          );
      continue;
    }

    const formattedFieldValue = formatFieldMetadataValue(
      value,
      fieldMetadata.type,
    );

    // @ts-expect-error legacy noImplicitAny
    newData[key] = formattedFieldValue;
  }

  // After assembling composite fields, handle those with missing required subfields
  handleEmptyCompositeFields(
    newData,
    objectCache.compositeFieldMetadataWithRequiredProperties,
  );

  for (const dateTimeField of objectCache.dateTimeFieldMetadataItems) {
    // @ts-expect-error legacy noImplicitAny
    const rawUpdatedDateTime = newData[dateTimeField.name] as
      | string
      | Date
      | null
      | undefined
      | Record<string, unknown>;

    if (!isDefined(rawUpdatedDateTime)) {
      continue;
    }

    if (
      typeof rawUpdatedDateTime === 'string' ||
      rawUpdatedDateTime instanceof Date ||
      isPlainObject(rawUpdatedDateTime)
    ) {
      // @ts-expect-error legacy noImplicitAny
      newData[dateTimeField.name] = rawUpdatedDateTime;
    } else {
      const stringifiedUnknownValue = stringifySafely(rawUpdatedDateTime);

      throw new Error(
        `Invalid DATE_TIME field "${dateTimeField.name}", value: "${stringifiedUnknownValue}", it should be a string, Date instance or plain object, (current type : ${typeof rawUpdatedDateTime}).`,
      );
    }
  }

  return newData as T;
}

function getOrCreateFormatResultObjectCache({
  cache,
  flatObjectMetadata,
  fieldMapsForObject,
}: {
  cache: FormatResultCache;
  flatObjectMetadata: FlatObjectMetadata;
  fieldMapsForObject?: FieldMapsForObject;
}): FormatResultObjectCache {
  const cachedObjectCache = cache.objectCacheByObjectMetadataId.get(
    flatObjectMetadata.id,
  );

  if (isDefined(cachedObjectCache)) {
    return cachedObjectCache;
  }

  const flatFieldMetadataItems = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    cache.flatFieldMetadataMaps,
  );
  const compositeFieldMetadataCollection = flatFieldMetadataItems.filter(
    (fieldMetadata) => isCompositeFieldMetadataType(fieldMetadata.type),
  );

  const objectCache = {
    fieldMaps:
      fieldMapsForObject ??
      buildFieldMapsFromFlatObjectMetadata(
        cache.flatFieldMetadataMaps,
        flatObjectMetadata,
      ),
    compositeFieldMetadataMap: getCompositeFieldMetadataMapFromCollection(
      compositeFieldMetadataCollection,
    ),
    compositeFieldMetadataWithRequiredProperties:
      compositeFieldMetadataCollection.map((fieldMetadata) => {
        const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

        return {
          fieldMetadata,
          requiredPropertyNames:
            compositeType?.properties
              .filter((property) => property.isRequired)
              .map((property) => property.name) ?? [],
        };
      }),
    dateTimeFieldMetadataItems: flatFieldMetadataItems.filter(
      (fieldMetadata) => fieldMetadata.type === FieldMetadataType.DATE_TIME,
    ),
  } satisfies FormatResultObjectCache;

  cache.objectCacheByObjectMetadataId.set(flatObjectMetadata.id, objectCache);

  return objectCache;
}

export function getCompositeFieldMetadataMap(
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) {
  const compositeFieldMetadataCollection = getCompositeFieldMetadataCollection(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  return getCompositeFieldMetadataMapFromCollection(
    compositeFieldMetadataCollection,
  );
}

function getCompositeFieldMetadataMapFromCollection(
  compositeFieldMetadataCollection: FlatFieldMetadata[],
) {
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
  // oxlint-disable-next-line typescript/no-explicit-any
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
  fieldMetadata: FlatFieldMetadata,
) {
  if (!isNull(value)) return value;

  return (
    DEFAULT_COMPOSITE_FIELDS_NULL_EQUIVALENT_VALUE[fieldMetadata.type]?.[
      compositePropertyName
    ] ?? value
  );
}

/**
 * Handles composite fields with missing required subfields.
 * - For nullable fields: sets to null if all required subfields are null
 * - For non-nullable fields: provides a default value to prevent GraphQL errors
 *
 * This handles existing records that were created before the field was added
 * or records with incomplete data.
 */
function handleEmptyCompositeFields(
  // oxlint-disable-next-line typescript/no-explicit-any
  data: Record<string, any>,
  compositeFieldMetadataWithRequiredProperties: CompositeFieldMetadataWithRequiredProperties[],
) {
  for (const {
    fieldMetadata,
    requiredPropertyNames,
  } of compositeFieldMetadataWithRequiredProperties) {
    const fieldValue = data[fieldMetadata.name];

    if (!isDefined(fieldValue) || !isPlainObject(fieldValue)) {
      continue;
    }

    // oxlint-disable-next-line typescript/no-explicit-any
    const typedFieldValue = fieldValue as Record<string, any>;

    const allRequiredPropertiesAreNull = requiredPropertyNames.every(
      (propertyName) =>
        !isDefined(typedFieldValue[propertyName]) ||
        isNull(typedFieldValue[propertyName]),
    );

    if (allRequiredPropertiesAreNull && requiredPropertyNames.length > 0) {
      if (fieldMetadata.isNullable) {
        data[fieldMetadata.name] = null;
      } else {
        data[fieldMetadata.name] = getDefaultCompositeFieldValue(
          fieldMetadata.type,
        );
      }
    }
  }
}

function getDefaultCompositeFieldValue(
  fieldType: FieldMetadataType,
  // oxlint-disable-next-line typescript/no-explicit-any
): Record<string, any> | null {
  switch (fieldType) {
    case FieldMetadataType.ACTOR:
      return {
        source: FieldActorSource.MANUAL,
        name: '',
        workspaceMemberId: null,
        context: {},
      };
    default:
      // For other composite types, return null and let GraphQL handle the error
      // This should be extended as needed for other non-nullable composite fields
      return null;
  }
}
