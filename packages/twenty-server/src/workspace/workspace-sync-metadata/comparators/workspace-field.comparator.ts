import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  FieldComparatorResult,
} from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { transformMetadataForComparison } from 'src/workspace/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const fieldPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'objectMetadataId',
  'isActive',
] as const;

const fieldPropertiesToStringify = [
  'targetColumnMap',
  'defaultValue',
  'options',
] as const;

@Injectable()
export class WorkspaceFieldComparator {
  constructor() {}

  public compare(
    originalObjectMetadata: ObjectMetadataEntity,
    standardObjectMetadata: PartialObjectMetadata,
  ): FieldComparatorResult[] {
    const result: FieldComparatorResult[] = [];
    const fieldPropertiesToUpdateMap: Record<
      string,
      Partial<PartialFieldMetadata>
    > = {};
    // Double security to only compare non-custom fields
    const filteredOriginalFieldCollection =
      originalObjectMetadata.fields.filter((field) => !field.isCustom);
    const originalFieldMetadataMap = transformMetadataForComparison(
      filteredOriginalFieldCollection,
      {
        propertiesToIgnore: fieldPropertiesToIgnore,
        propertiesToStringify: fieldPropertiesToStringify,
        keyFactory(datum) {
          return datum.name;
        },
      },
    );
    const standardFieldMetadataMap = transformMetadataForComparison(
      standardObjectMetadata.fields,
      {
        propertiesToStringify: fieldPropertiesToStringify,
        keyFactory(datum) {
          return datum.name;
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
      // Object shouldn't have thousands of fields, so we can use find here
      const standardFieldMetadata = standardObjectMetadata.fields.find(
        (field) => field.name === fieldName,
      );
      const originalFieldMetadata = originalObjectMetadata.fields.find(
        (field) => field.name === fieldName,
      );

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
