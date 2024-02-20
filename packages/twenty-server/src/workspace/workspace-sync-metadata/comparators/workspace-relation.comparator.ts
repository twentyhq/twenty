import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  RelationComparatorResult,
} from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';

import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { transformMetadataForComparison } from 'src/workspace/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const relationPropertiesToIgnore = ['createdAt', 'updatedAt'] as const;
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
        propertiesToIgnore: relationPropertiesToIgnore,
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
      const fieldName = difference.path[0];
      const property = difference.path[difference.path.length - 1];

      if (difference.type === 'CREATE') {
        results.push({
          action: ComparatorAction.CREATE,
          object: difference.value,
        });
      } else if (
        difference.type === 'REMOVE' &&
        difference.path[difference.path.length - 1] !== 'id'
      ) {
        results.push({
          action: ComparatorAction.DELETE,
          object: difference.oldValue,
        });
      } else if (
        difference.type === 'CHANGE' &&
        relationPropertiesToUpdate.includes(property as string)
      ) {
        const originalRelationMetadata = originalRelationMetadataMap[fieldName];

        if (!originalRelationMetadata) {
          throw new Error(
            `Relation ${fieldName} not found in originalRelationMetadataMap`,
          );
        }

        results.push({
          action: ComparatorAction.UPDATE,
          object: {
            id: originalRelationMetadata.id,
            fromObjectMetadataId: originalRelationMetadata.fromObjectMetadataId,
            fromFieldMetadataId: originalRelationMetadata.fromFieldMetadataId,
            toObjectMetadataId: originalRelationMetadata.toObjectMetadataId,
            toFieldMetadataId: originalRelationMetadata.toFieldMetadataId,
            workspaceId: originalRelationMetadata.workspaceId,
            ...{
              [property]: difference.value,
            },
          },
        });
      }
    }

    return results;
  }
}
