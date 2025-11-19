import { Injectable } from '@nestjs/common';

import diff from 'microdiff';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  ComparatorAction,
  type FieldComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type ComputedPartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const commonFieldPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'objectMetadataId',
  'isActive',
  'options',
  'settings',
  'joinColumn',
  'gate',
  'asExpression',
  'generatedType',
  'isLabelSyncedWithName',
  'relationTargetFieldMetadataId',
  'relationTargetObjectMetadataId',
  'relationTargetFieldMetadata',
  'relationTargetObjectMetadata',
  'universalIdentifier',
  'applicationId',
];

const fieldPropertiesToStringify = ['defaultValue'] as const;

const shouldNotOverrideDefaultValue = (
  fieldMetadata: FieldMetadataEntity | ComputedPartialFieldMetadata,
) => {
  return [
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.PHONES,
    FieldMetadataType.ADDRESS,
  ].includes(fieldMetadata.type);
};

const shouldSkipFieldCreation = (
  standardFieldMetadata: ComputedPartialFieldMetadata | undefined,
) => {
  return standardFieldMetadata?.isCustom;
};

@Injectable()
export class WorkspaceFieldComparator {
  constructor() {}

  public compare(
    originalObjectMetadataId: string,
    originalFieldMetadataCollection: FieldMetadataEntity[],
    standardFieldMetadataCollection: ComputedPartialFieldMetadata[],
  ): FieldComparatorResult[] {
    const result: FieldComparatorResult[] = [];
    const fieldPropertiesToUpdateMap: Record<
      string,
      Partial<ComputedPartialFieldMetadata>
    > = {};

    // Double security to only compare non-custom fields
    const filteredOriginalFieldCollection =
      originalFieldMetadataCollection.filter((field) => !field.isCustom);
    const originalFieldMetadataMap = transformMetadataForComparison(
      filteredOriginalFieldCollection,
      {
        shouldIgnoreProperty: (
          property,
          fieldMetadata: FieldMetadataEntity,
        ) => {
          if (
            property === 'defaultValue' &&
            shouldNotOverrideDefaultValue(fieldMetadata)
          ) {
            return true;
          }

          if (commonFieldPropertiesToIgnore.includes(property)) {
            return true;
          }

          return false;
        },
        propertiesToStringify: fieldPropertiesToStringify,
        keyFactory(datum) {
          // Happen when the field is custom
          return datum.standardId || datum.name;
        },
      },
    );
    const standardFieldMetadataMap = transformMetadataForComparison(
      standardFieldMetadataCollection,
      {
        shouldIgnoreProperty: (
          property,
          fieldMetadata: ComputedPartialFieldMetadata,
        ) => {
          if (
            property === 'defaultValue' &&
            shouldNotOverrideDefaultValue(fieldMetadata)
          ) {
            return true;
          }

          if (commonFieldPropertiesToIgnore.includes(property)) {
            return true;
          }

          return false;
        },
        propertiesToStringify: fieldPropertiesToStringify,
        keyFactory(datum) {
          // Happen when the field is custom
          return datum.standardId || datum.name;
        },
      },
    );

    // Compare fields
    const fieldMetadataDifference = diff(
      originalFieldMetadataMap,
      standardFieldMetadataMap,
    );

    for (const difference of fieldMetadataDifference) {
      const fieldName = difference.path[0];
      const findField = (
        field: ComputedPartialFieldMetadata | FieldMetadataEntity,
      ) => {
        return field.standardId === fieldName;
      };
      // Object shouldn't have thousands of fields, so we can use find here
      const standardFieldMetadata =
        standardFieldMetadataCollection.find(findField);
      const originalFieldMetadata =
        originalFieldMetadataCollection.find(findField);

      switch (difference.type) {
        case 'CREATE': {
          if (shouldSkipFieldCreation(standardFieldMetadata)) {
            break;
          }
          if (!standardFieldMetadata) {
            throw new Error(
              `Field ${fieldName} not found in standardObjectMetadata`,
            );
          }

          result.push({
            action: ComparatorAction.CREATE,
            object: {
              ...standardFieldMetadata,
              objectMetadataId: originalObjectMetadataId,
            },
          });
          break;
        }
        case 'CHANGE': {
          if (!originalFieldMetadata) {
            throw new Error(
              `Field ${fieldName} not found in originalObjectMetadata`,
            );
          }

          const id = originalFieldMetadata.id;
          const property = difference.path[difference.path.length - 1];

          // If the old value and the new value are both null, skip
          // Database is storing null, and we can get undefined here
          if (
            difference.oldValue === null &&
            (difference.value === null || difference.value === undefined)
          ) {
            break;
          }

          if (typeof property !== 'string') {
            break;
          }

          if (!fieldPropertiesToUpdateMap[id]) {
            fieldPropertiesToUpdateMap[id] = {};
          }

          // If the property is a stringified JSON, parse it
          if (
            (fieldPropertiesToStringify as readonly string[]).includes(property)
          ) {
            // @ts-expect-error legacy noImplicitAny
            fieldPropertiesToUpdateMap[id][property] = this.parseJSONOrString(
              difference.value,
            );
          } else {
            // @ts-expect-error legacy noImplicitAny
            fieldPropertiesToUpdateMap[id][property] = difference.value;
          }
          break;
        }
        case 'REMOVE': {
          if (!originalFieldMetadata) {
            throw new Error(
              `Field ${fieldName} not found in originalObjectMetadata`,
            );
          }

          if (difference.path.length === 1) {
            result.push({
              action: ComparatorAction.DELETE,
              object: originalFieldMetadata,
            });
          }
          break;
        }
      }
    }

    for (const [id, fieldPropertiesToUpdate] of Object.entries(
      fieldPropertiesToUpdateMap,
    )) {
      result.push({
        action: ComparatorAction.UPDATE,
        object: {
          id,
          ...fieldPropertiesToUpdate,
        },
      });
    }

    return result;
  }

  private parseJSONOrString(value: string | null): string | object | null {
    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
