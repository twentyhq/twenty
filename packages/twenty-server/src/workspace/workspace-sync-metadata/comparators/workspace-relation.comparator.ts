import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  RelationComparatorResult,
} from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';

import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { transformMetadataForComparison } from 'src/workspace/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const relationPropertiesToIgnore = ['createdAt', 'updatedAt'] as const;

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
      }
    }

    return results;
  }
}
