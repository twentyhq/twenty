import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  RelationComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const relationPropertiesToIgnore = ['createdAt', 'updatedAt'];
const relationPropertiesToUpdate = ['onDeleteAction'];

@Injectable()
export class WorkspaceRelationComparator {
  constructor() {}

  compare(
    originalRelationMetadataCollection: RelationMetadataEntity[],
    standardRelationMetadataCollection: Partial<RelationMetadataEntity>[],
  ): RelationComparatorResult[] {
    const results: RelationComparatorResult[] = [];

    // Create a map of standard relations
    const standardRelationMetadataMap = transformMetadataForComparison(
      standardRelationMetadataCollection,
      {
        keyFactory(relationMetadata) {
          return `${relationMetadata.fromObjectMetadataId}->${relationMetadata.fromFieldMetadataId}`;
        },
      },
    );

    // Create a filtered map of original relations
    // We filter out 'id' later because we need it to remove the relation from DB
    const originalRelationMetadataMap = transformMetadataForComparison(
      originalRelationMetadataCollection,
      {
        shouldIgnoreProperty: (property) =>
          relationPropertiesToIgnore.includes(property),
        keyFactory(relationMetadata) {
          return `${relationMetadata.fromObjectMetadataId}->${relationMetadata.fromFieldMetadataId}`;
        },
      },
    );

    // Compare relations
    const relationMetadataDifference = diff(
      originalRelationMetadataMap,
      standardRelationMetadataMap,
    );

    for (const difference of relationMetadataDifference) {
      switch (difference.type) {
        case 'CREATE': {
          results.push({
            action: ComparatorAction.CREATE,
            object: difference.value,
          });
          break;
        }
        case 'REMOVE': {
          if (difference.path[difference.path.length - 1] !== 'id') {
            results.push({
              action: ComparatorAction.DELETE,
              object: difference.oldValue,
            });
          }
          break;
        }
        case 'CHANGE': {
          const fieldName = difference.path[0];
          const property = difference.path[difference.path.length - 1];

          if (!relationPropertiesToUpdate.includes(property as string)) {
            continue;
          }

          const originalRelationMetadata =
            originalRelationMetadataMap[fieldName];

          if (!originalRelationMetadata) {
            throw new Error(
              `Relation ${fieldName} not found in originalRelationMetadataMap`,
            );
          }

          results.push({
            action: ComparatorAction.UPDATE,
            object: {
              id: originalRelationMetadata.id,
              fromObjectMetadataId:
                originalRelationMetadata.fromObjectMetadataId,
              fromFieldMetadataId: originalRelationMetadata.fromFieldMetadataId,
              toObjectMetadataId: originalRelationMetadata.toObjectMetadataId,
              toFieldMetadataId: originalRelationMetadata.toFieldMetadataId,
              workspaceId: originalRelationMetadata.workspaceId,
              ...{
                [property]: difference.value,
              },
            },
          });
          break;
        }
      }
    }

    return results;
  }
}
