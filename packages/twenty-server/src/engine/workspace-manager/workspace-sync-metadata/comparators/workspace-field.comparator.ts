import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  FieldComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { ComputedPartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { ComputedPartialObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const commonFieldPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'objectMetadataId',
  'isActive',
  'options',
];

const fieldPropertiesToStringify = ['targetColumnMap', 'defaultValue'] as const;

@Injectable()
export class WorkspaceFieldComparator {
  constructor() {}

  public compare(
    originalObjectMetadata: ObjectMetadataEntity,
    standardObjectMetadata: ComputedPartialObjectMetadata,
  ): FieldComparatorResult[] {
    const result: FieldComparatorResult[] = [];
    const fieldPropertiesToUpdateMap: Record<
      string,
      Partial<ComputedPartialFieldMetadata>
    > = {};

    // Double security to only compare non-custom fields
    const filteredOriginalFieldCollection =
      originalObjectMetadata.fields.filter((field) => !field.isCustom);
    const originalFieldMetadataMap = transformMetadataForComparison(
      filteredOriginalFieldCollection,
      {
        shouldIgnoreProperty: (property, originalMetadata) => {
          if (commonFieldPropertiesToIgnore.includes(property)) {
            return true;
          }

          if (
            originalMetadata &&
            property === 'defaultValue' &&
            originalMetadata.type === FieldMetadataType.SELECT
          ) {
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
      standardObjectMetadata.fields,
      {
        shouldIgnoreProperty: (property, originalMetadata) => {
          if (['options', 'gate'].includes(property)) {
            return true;
          }

          if (
            originalMetadata &&
            property === 'defaultValue' &&
            originalMetadata.type === FieldMetadataType.SELECT
          ) {
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
        if (field.isCustom) {
          return field.name === fieldName;
        }

        return field.standardId === fieldName;
      };
      // Object shouldn't have thousands of fields, so we can use find here
      const standardFieldMetadata =
        standardObjectMetadata.fields.find(findField);
      const originalFieldMetadata =
        originalObjectMetadata.fields.find(findField);

      switch (difference.type) {
        case 'CREATE': {
          if (!standardFieldMetadata) {
            throw new Error(
              `Field ${fieldName} not found in standardObjectMetadata`,
            );
          }

          result.push({
            action: ComparatorAction.CREATE,
            object: {
              ...standardFieldMetadata,
              objectMetadataId: originalObjectMetadata.id,
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
            fieldPropertiesToUpdateMap[id][property] = JSON.parse(
              difference.value,
            );
          } else {
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
}
