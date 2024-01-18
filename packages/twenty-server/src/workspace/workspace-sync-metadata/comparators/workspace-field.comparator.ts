import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  FieldComparatorResult,
} from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import {
  MappedObjectMetadata,
  MappedObjectMetadataEntity,
} from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { filterIgnoredProperties } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';

const fieldPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'objectMetadataId',
  'isActive',
];

@Injectable()
export class WorkspaceFieldComparator {
  constructor() {}

  public compare(
    originalObjectMetadata: MappedObjectMetadataEntity,
    standardObjectMetadata: MappedObjectMetadata,
  ): FieldComparatorResult[] {
    const result: FieldComparatorResult[] = [];
    const fieldPropertiesToUpdateMap: Record<
      string,
      Partial<FieldMetadataEntity>
    > = {};

    const partialOriginalFieldMetadataMap = Object.fromEntries(
      Object.entries(originalObjectMetadata.fields).map(([key, value]) => {
        if (value === null || typeof value !== 'object') {
          return [key, value];
        }

        return [
          key,
          filterIgnoredProperties(
            value,
            fieldPropertiesToIgnore,
            (property) => {
              if (property !== null && typeof property === 'object') {
                return JSON.stringify(property);
              }

              return property;
            },
          ),
        ];
      }),
    );

    // Compare fields
    const fieldMetadataDifference = diff(
      partialOriginalFieldMetadataMap,
      standardObjectMetadata.fields,
    );

    for (const difference of fieldMetadataDifference) {
      const fieldName = difference.path[0];

      switch (difference.type) {
        case 'CREATE': {
          result.push({
            action: ComparatorAction.CREATE,
            object: {
              ...standardObjectMetadata.fields[fieldName],
              objectMetadataId: originalObjectMetadata.id,
            },
          });
          break;
        }
        case 'CHANGE': {
          const id = originalObjectMetadata.fields[fieldName].id;
          const property = difference.path[difference.path.length - 1];

          if (!fieldPropertiesToUpdateMap[id]) {
            fieldPropertiesToUpdateMap[id] = {};
          }

          fieldPropertiesToUpdateMap[id][property] = difference.value;
          break;
        }
        case 'REMOVE': {
          if (difference.path.length === 1) {
            result.push({
              action: ComparatorAction.DELETE,
              object: originalObjectMetadata.fields[fieldName],
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
