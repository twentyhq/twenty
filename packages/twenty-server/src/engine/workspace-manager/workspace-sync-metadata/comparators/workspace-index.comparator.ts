import { Injectable } from '@nestjs/common';

import diff from 'microdiff';

import {
  ComparatorAction,
  type IndexComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const propertiesToIgnore = [
  'createdAt',
  'updatedAt',
  'indexFieldMetadatas',
  'universalIdentifier',
  'applicationId',
];

@Injectable()
export class WorkspaceIndexComparator {
  constructor() {}

  compare(
    originalIndexMetadataCollection: IndexMetadataEntity[],
    standardIndexMetadataCollection: Partial<IndexMetadataEntity>[],
  ): IndexComparatorResult[] {
    const results: IndexComparatorResult[] = [];

    // Create a map of standard relations
    const standardIndexMetadataMap = transformMetadataForComparison(
      standardIndexMetadataCollection,
      {
        keyFactory(indexMetadata) {
          return `${indexMetadata.name}`;
        },
      },
    );

    const originalIndexMetadataCollectionWithColumns =
      originalIndexMetadataCollection.map((indexMetadata) => {
        return {
          ...indexMetadata,
          columns: indexMetadata.indexFieldMetadatas.map(
            (indexFieldMetadata) => indexFieldMetadata.fieldMetadata.name,
          ),
          indexFieldMetadatas: undefined,
        };
      });

    // Create a filtered map of original relations
    // We filter out 'id' later because we need it to remove the relation from DB
    const originalIndexMetadataMap = transformMetadataForComparison(
      originalIndexMetadataCollectionWithColumns,
      {
        shouldIgnoreProperty: (property) =>
          propertiesToIgnore.includes(property),
        keyFactory(indexMetadata) {
          return `${indexMetadata.name}`;
        },
      },
    );

    // Compare indexes
    const indexesDifferences = diff(
      originalIndexMetadataMap,
      standardIndexMetadataMap,
    );

    for (const difference of indexesDifferences) {
      // TODO: This code prevent index updates, we need to handle them
      if (difference.path.length > 1) {
        continue;
      }

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
        default:
          break;
      }
    }

    return results;
  }
}
