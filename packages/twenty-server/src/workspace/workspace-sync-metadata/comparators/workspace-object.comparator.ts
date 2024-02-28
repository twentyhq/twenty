import { Injectable } from '@nestjs/common';

import diff from 'microdiff';
import omit from 'lodash.omit';

import {
  ComparatorAction,
  ObjectComparatorResult,
} from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { transformMetadataForComparison } from 'src/workspace/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

const objectPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'labelIdentifierFieldMetadataId',
  'imageIdentifierFieldMetadataId',
  'isActive',
  'fields',
];

const objectPropertiesToStringify = ['indexMetadata'] as const;

@Injectable()
export class WorkspaceObjectComparator {
  constructor() {}

  public compare(
    originalObjectMetadata: ObjectMetadataEntity | undefined,
    standardObjectMetadata: PartialObjectMetadata,
  ): ObjectComparatorResult {
    // If the object doesn't exist in the original metadata, we need to create it
    if (!originalObjectMetadata) {
      return {
        action: ComparatorAction.CREATE,
        object: standardObjectMetadata,
      };
    }

    const objectPropertiesToUpdate: Partial<PartialObjectMetadata> = {};

    // Only compare properties that are not ignored
    const partialOriginalObjectMetadata = transformMetadataForComparison(
      originalObjectMetadata,
      {
        shouldIgnoreProperty: (property) =>
          objectPropertiesToIgnore.includes(property),
        propertiesToStringify: objectPropertiesToStringify,
      },
    );

    const partialStandardObjectMetadata = transformMetadataForComparison(
      omit(standardObjectMetadata, 'fields'),
      {
        shouldIgnoreProperty: (property) =>
          objectPropertiesToIgnore.includes(property),
        propertiesToStringify: objectPropertiesToStringify,
      },
    );

    // Compare objects
    const objectMetadataDifference = diff(
      partialOriginalObjectMetadata,
      partialStandardObjectMetadata,
    );

    // Loop through the differences and create an object with the properties to update
    for (const difference of objectMetadataDifference) {
      // We only handle CHANGE here as REMOVE and CREATE are handled earlier.
      if (difference.type === 'CHANGE') {
        const property = difference.path[0];

        if (typeof property !== 'string') {
          break;
        }

        // Handle indexMetadata
        if ('indexMetadata' === property) {
          objectPropertiesToUpdate['indexMetadata'] = JSON.parse(
            difference.value,
          );
          objectPropertiesToUpdate['previousIndexMetadata'] = JSON.parse(
            difference.oldValue,
          );
        } else {
          objectPropertiesToUpdate[property] = difference.value;
        }
      }
    }

    // If there are no properties to update, the objects are equal
    if (Object.keys(objectPropertiesToUpdate).length === 0) {
      return {
        action: ComparatorAction.SKIP,
      };
    }

    // If there are properties to update, we need to update the object
    return {
      action: ComparatorAction.UPDATE,
      object: {
        id: originalObjectMetadata.id,
        ...objectPropertiesToUpdate,
      },
    };
  }
}
