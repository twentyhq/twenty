import { Injectable } from '@nestjs/common';

import diff from 'microdiff';
import { FieldMetadataType } from 'twenty-shared';

import {
  ComparatorAction,
  FieldRelationComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const fieldPropertiesToCompare = [
  'settings',
  'relationTargetObjectMetadataId',
  'relationTargetFieldMetadataId',
];

const fieldPropertiesToStringify = ['settings'] as const;

@Injectable()
export class WorkspaceFieldRelationComparator {
  constructor() {}

  public compare(
    originalFieldMetadataCollection: FieldMetadataEntity[],
    standardFieldMetadataCollection: FieldMetadataEntity<FieldMetadataType.RELATION>[],
  ): FieldRelationComparatorResult[] {
    const result: FieldRelationComparatorResult[] = [];
    const fieldPropertiesToUpdateMap: Record<
      string,
      Partial<FieldMetadataEntity>
    > = {};

    // Double security to only compare non-custom fields
    const filteredOriginalFieldCollection =
      originalFieldMetadataCollection.filter((field) => !field.isCustom);
    const originalFieldMetadataMap = transformMetadataForComparison(
      filteredOriginalFieldCollection,
      {
        shouldIgnoreProperty: (property) => {
          if (fieldPropertiesToCompare.includes(property)) {
            return false;
          }

          return true;
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
        shouldIgnoreProperty: (property) => {
          if (fieldPropertiesToCompare.includes(property)) {
            return false;
          }

          return true;
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
      const findField = (field: FieldMetadataEntity) => {
        return field.standardId === fieldName;
      };
      // Object shouldn't have thousands of fields, so we can use find here
      const originalFieldMetadata =
        originalFieldMetadataCollection.find(findField);

      switch (difference.type) {
        case 'CREATE': {
          throw new Error(
            `CREATE should never happen when comparing relations as they are created previously`,
          );
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
            fieldPropertiesToUpdateMap[id][property] = this.parseJSONOrString(
              difference.value,
            );
          } else {
            fieldPropertiesToUpdateMap[id][property] = difference.value;
          }
          break;
        }
        case 'REMOVE': {
          throw new Error(
            `REMOVE should never happen when comparing relations as they are created previously`,
          );
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
