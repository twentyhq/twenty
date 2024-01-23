import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  FieldComparatorResult,
} from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { transformFieldMetadataForComparison } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

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
    const originalFieldMetadataMap = transformFieldMetadataForComparison(
      originalObjectMetadata.fields,
      {
        fieldPropertiesToIgnore,
        fieldPropertiesToStringify,
      },
    );
    const standardFieldMetadataMap = transformFieldMetadataForComparison(
      standardObjectMetadata.fields,
      {
        fieldPropertiesToStringify,
      },
    );

    // console.log('originalFieldMetadataMap: ', originalFieldMetadataMap);
    // console.log('standardFieldMetadataMap: ', standardFieldMetadataMap);

    // Compare fields
    const fieldMetadataDifference = diff(
      originalFieldMetadataMap,
      standardFieldMetadataMap,
    );

    console.log('fieldMetadataDifference: ', fieldMetadataDifference);

    for (const difference of fieldMetadataDifference) {
      const fieldName = difference.path[0];
      const originalFieldMetadata = originalObjectMetadata.fields.find(
        (field) => field.name === fieldName,
      );

      if (!originalFieldMetadata) {
        throw new Error(
          `Field ${fieldName} not found in originalObjectMetadata`,
        );
      }

      switch (difference.type) {
        case 'CREATE': {
          result.push({
            action: ComparatorAction.CREATE,
            object: {
              ...originalFieldMetadata,
              objectMetadataId: originalObjectMetadata.id,
            },
          });
          break;
        }
        case 'CHANGE': {
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

    if (Object.keys(fieldPropertiesToUpdateMap).length > 0) {
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
    }

    return result;
  }
}
