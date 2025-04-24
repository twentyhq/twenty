import { Injectable } from '@nestjs/common';

import diff, { DifferenceChange, DifferenceRemove } from 'microdiff';
import { FieldMetadataType } from 'twenty-shared/types';

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
    const propertiesMap: Record<
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

    const fieldMetadataDifferenceMap = fieldMetadataDifference.reduce(
      (acc, difference) => {
        const fieldId = difference.path[0];

        if (difference.type === 'CREATE') {
          throw new Error(
            `CREATE should never happen when comparing relations as they are created previously`,
          );
        }

        if (!acc[fieldId]) {
          acc[fieldId] = [];
        }

        acc[fieldId].push(difference);

        return acc;
      },
      {} as Record<string, (DifferenceChange | DifferenceRemove)[]>,
    );

    differenceLoop: for (const [fieldId, differences] of Object.entries(
      fieldMetadataDifferenceMap,
    )) {
      const findField = (
        field: FieldMetadataEntity<FieldMetadataType.RELATION>,
      ) => {
        return field.standardId === fieldId;
      };
      // Object shouldn't have thousands of fields, so we can use find here
      const standardFieldMetadata =
        standardFieldMetadataCollection.find(findField);
      const originalFieldMetadata =
        originalFieldMetadataCollection.find(findField);
      const allNewPropertiesAreNull = Object.values(differences).every(
        (difference) => {
          if (difference.type === 'REMOVE') {
            return true;
          }

          return difference.value === null;
        },
      );
      const allOldPropertiesAreNull = Object.values(differences).every(
        (difference) => difference.oldValue === null,
      );
      let relationTypeChange = false;

      if (!originalFieldMetadata) {
        throw new Error(`Field ${fieldId} not found in originalObjectMetadata`);
      }

      if (!standardFieldMetadata) {
        throw new Error(`Field ${fieldId} not found in standardObjectMetadata`);
      }

      for (const difference of differences) {
        const property = difference.path[difference.path.length - 1];

        if (difference.type === 'REMOVE') {
          // Whole relation is removed
          if (property === fieldId) {
            result.push({
              action: ComparatorAction.DELETE,
              object: originalFieldMetadata,
            });

            continue differenceLoop;
          }

          throw new Error(
            `REMOVE partial part of relation should never happen, it should ben an update`,
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

        if (typeof property !== 'string') {
          break;
        }

        if (!propertiesMap[fieldId]) {
          propertiesMap[fieldId] = {};
        }

        // If the property is a stringified JSON, parse it
        if (
          (fieldPropertiesToStringify as readonly string[]).includes(property)
        ) {
          const newValue = this.parseJSONOrString(difference.value);

          if (property === 'settings' && difference.oldValue) {
            const newSettings = newValue as FieldMetadataRelationSettings;
            const oldSettings =
              difference.oldValue as FieldMetadataRelationSettings;

            // Check if the relation type has changed
            if (oldSettings.relationType !== newSettings.relationType) {
              relationTypeChange = true;
            }
          }

          propertiesMap[fieldId][property] = newValue;
        } else {
          propertiesMap[fieldId][property] = difference.value;
        }
      }

      if (relationTypeChange) {
        result.push({
          action: ComparatorAction.DELETE,
          object: originalFieldMetadata,
        });

        result.push({
          action: ComparatorAction.CREATE,
          object: {
            ...propertiesMap[fieldId],
            id: originalFieldMetadata.id,
            standardId: standardFieldMetadata.standardId ?? undefined,
          },
        });
      } else if (allOldPropertiesAreNull) {
        result.push({
          action: ComparatorAction.CREATE,
          object: {
            ...propertiesMap[fieldId],
            id: originalFieldMetadata.id,
            standardId: standardFieldMetadata.standardId ?? undefined,
          },
        });
      } else if (allNewPropertiesAreNull) {
        result.push({
          action: ComparatorAction.DELETE,
          object: originalFieldMetadata,
        });
      } else {
        result.push({
          action: ComparatorAction.UPDATE,
          object: {
            ...propertiesMap[fieldId],
            id: originalFieldMetadata.id,
            standardId: standardFieldMetadata.standardId ?? undefined,
          },
        });
      }
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
