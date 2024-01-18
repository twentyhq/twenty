import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  RelationComparatorResult,
} from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';

import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { filterIgnoredProperties } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';

const relationPropertiesToIgnore = ['createdAt', 'updatedAt'];

@Injectable()
export class WorkspaceRelationComparator {
  constructor() {}

  compare(
    originalRelationMetadataCollection: RelationMetadataEntity[],
    standardRelationMetadataCollection: Partial<RelationMetadataEntity>[],
  ): RelationComparatorResult[] {
    const results: RelationComparatorResult[] = [];

    // Create a map of standard relations
    const standardRelationMetadataMap =
      standardRelationMetadataCollection.reduce(
        (result, currentObject) => {
          const key = `${currentObject.fromObjectMetadataId}->${currentObject.fromFieldMetadataId}`;

          result[key] = currentObject;

          return result;
        },
        {} as Record<string, Partial<RelationMetadataEntity>>,
      );
    // Create a filtered map of original relations
    // Just a small name to be sure (58 characters) 😅
    // We filter out 'id' later because we need it to remove the relation from DB
    const originalRelationMetadataMapWithoutIgnoredProperties =
      originalRelationMetadataCollection
        .map((relationMetadata) =>
          filterIgnoredProperties(relationMetadata, relationPropertiesToIgnore),
        )
        .reduce(
          (result, currentObject) => {
            const key = `${currentObject.fromObjectMetadataId}->${currentObject.fromFieldMetadataId}`;

            result[key] = currentObject;

            return result;
          },
          {} as Record<string, RelationMetadataEntity>,
        );

    // Compare relations
    const relationMetadataDifference = diff(
      originalRelationMetadataMapWithoutIgnoredProperties,
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
