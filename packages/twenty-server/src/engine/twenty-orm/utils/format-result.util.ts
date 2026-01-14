import { isPlainObject } from '@nestjs/common/utils/shared.utils';

import { isNull } from '@sniptt/guards';
import {
  FieldActorSource,
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  DEFAULT_ARRAY_FIELD_NULL_EQUIVALENT_VALUE,
  DEFAULT_COMPOSITE_FIELDS_NULL_EQUIVALENT_VALUE,
  DEFAULT_TEXT_FIELD_NULL_EQUIVALENT_VALUE,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/constants/null-equivalent-values.constant';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  buildFieldMapsFromFlatObjectMetadata,
  type FieldMapsForObject,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompositeFieldMetadataCollection } from 'src/engine/twenty-orm/utils/get-composite-field-metadata-collection';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export function formatResult<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  flatObjectMetadata: FlatObjectMetadata | undefined,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  fieldMapsForObject?: FieldMapsForObject,
): T {
  if (!isDefined(data)) {
    return data;
  }

  if (!isPlainObject(data)) {
    if (Array.isArray(data)) {
      return data.map((item) =>
        formatResult(
          item,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          fieldMapsForObject,
        ),
      ) as T;
    }

    return data;
  }

  if (!flatObjectMetadata) {
    throw new Error('Object metadata is missing');
  }

  const fieldMaps =
    fieldMapsForObject ??
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  const { fieldIdByName } = fieldMaps;

  const compositeFieldMetadataMap = getCompositeFieldMetadataMap(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const newData: object = {};

  for (const [key, value] of Object.entries(data)) {
    const compositePropertyArgs = compositeFieldMetadataMap.get(key);

    const fieldMetadataId =
      fieldIdByName[key] ||
      fieldIdByName[compositePropertyArgs?.parentField ?? ''];

    const fieldMetadata = flatFieldMetadataMaps.byId[fieldMetadataId] as
      | FlatFieldMetadata<FieldMetadataType>
      | undefined;

    const isRelation = fieldMetadata
      ? isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION)
      : false;

    if (!compositePropertyArgs && !isRelation) {
      if (isPlainObject(value)) {
        // @ts-expect-error legacy noImplicitAny
        newData[key] = formatResult(
          value,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          fieldMaps,
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
        flatObjectMetadataMaps.byId[
          fieldMetadata.relationTargetObjectMetadataId
        ];

      if (!targetObjectMetadata) {
        throw new Error(
          `Object metadata for object metadataId "${fieldMetadata.relationTargetObjectMetadataId}" is missing`,
        );
      }

      // @ts-expect-error legacy noImplicitAny
      newData[key] = formatResult(
        value,
        targetObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
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

  // After assembling composite fields, handle those with missing required subfields
  handleEmptyCompositeFields(
    newData,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const fieldMetadataItemsOfTypeDateOnly = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
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
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) {
  const compositeFieldMetadataCollection = getCompositeFieldMetadataCollection(
    flatObjectMetadata,
    flatFieldMetadataMaps,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) {
  const compositeFieldMetadataCollection = getCompositeFieldMetadataCollection(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  for (const fieldMetadata of compositeFieldMetadataCollection) {
    const fieldValue = data[fieldMetadata.name];

    if (!isDefined(fieldValue) || !isPlainObject(fieldValue)) {
      continue;
    }

    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) {
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedFieldValue = fieldValue as Record<string, any>;

    // Check if all required properties are null/undefined
    const requiredProperties = compositeType.properties.filter(
      (prop) => prop.isRequired,
    );

    const allRequiredPropertiesAreNull = requiredProperties.every(
      (prop) =>
        !isDefined(typedFieldValue[prop.name]) ||
        isNull(typedFieldValue[prop.name]),
    );

    if (allRequiredPropertiesAreNull && requiredProperties.length > 0) {
      if (fieldMetadata.isNullable) {
        // Field is nullable, set to null
        data[fieldMetadata.name] = null;
      } else {
        // Field is non-nullable, provide a default value
        data[fieldMetadata.name] = getDefaultCompositeFieldValue(
          fieldMetadata.type,
        );
      }
    }
  }
}

/**
 * Returns a default value for non-nullable composite fields.
 */
function getDefaultCompositeFieldValue(
  fieldType: FieldMetadataType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
