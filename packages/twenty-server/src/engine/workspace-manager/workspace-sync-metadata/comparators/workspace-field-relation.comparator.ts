import { Injectable } from '@nestjs/common';

import diff from 'microdiff';
import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataRelationSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
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
    originalFieldMetadataCollection: FieldMetadataEntity<FieldMetadataType.RELATION>[],
    standardFieldMetadataCollection: FieldMetadataEntity<FieldMetadataType.RELATION>[],
  ): FieldRelationComparatorResult[] {
    const result: FieldRelationComparatorResult[] = [];
    const fieldPropertiesToUpdateMap: Record<
      string,
      Partial<FieldMetadataEntity<FieldMetadataType.RELATION>>
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
      const findField = (
        field: FieldMetadataEntity<FieldMetadataType.RELATION>,
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

          // If the old value and the new value are both null, skip
          // Database is storing null, and we can get undefined here
          if (
            difference.oldValue === null &&
            (difference.value === null || difference.value === undefined)
          ) {
            break;
          }

          const id = originalFieldMetadata.id;
          const property = difference.path[difference.path.length - 1];

          if (typeof property !== 'string') {
            break;
          }

          console.log(difference);

          // We're creating a new relation field
          if (difference.oldValue === null) {
            if (!standardFieldMetadata) {
              throw new Error(
                `Field ${fieldName} not found in standardObjectMetadata`,
              );
            }

            result.push({
              action: ComparatorAction.CREATE,
              object: {
                ...standardFieldMetadata,
                standardId: standardFieldMetadata.standardId ?? undefined,
              },
            });
          }

          // We're updating a relation field
          if (difference.oldValue !== null && difference.value !== null) {
            if (!fieldPropertiesToUpdateMap[id]) {
              fieldPropertiesToUpdateMap[id] = {};
            }

            // Check the settings to see if the relation type has changed
            if (property === 'settings') {
              const newSettings = this.parseJSONOrString(
                difference.value,
              ) as FieldMetadataRelationSettings;
              const oldSettings = this.parseJSONOrString(
                difference.oldValue,
              ) as FieldMetadataRelationSettings;

              // If the relation type has changed, we need to delete the old relation and create a new one
              if (newSettings.relationType !== oldSettings.relationType) {
                if (!standardFieldMetadata) {
                  throw new Error(
                    `Field ${fieldName} not found in standardObjectMetadata`,
                  );
                }

                result.push({
                  action: ComparatorAction.DELETE,
                  object: originalFieldMetadata,
                });

                result.push({
                  action: ComparatorAction.CREATE,
                  object: {
                    ...standardFieldMetadata,
                    standardId: standardFieldMetadata.standardId ?? undefined,
                  },
                });
              } else {
                fieldPropertiesToUpdateMap[id][property] = newSettings;
              }
            } else {
              fieldPropertiesToUpdateMap[id][property] = difference.value;
            }
          }

          // We're deleting a relation field
          if (difference.value === null) {
            result.push({
              action: ComparatorAction.DELETE,
              object: originalFieldMetadata,
            });
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
          standardId: fieldPropertiesToUpdate.standardId ?? undefined,
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
