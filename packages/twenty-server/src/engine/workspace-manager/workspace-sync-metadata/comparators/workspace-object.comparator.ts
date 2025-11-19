import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import diff from 'microdiff';

import {
  ComparatorAction,
  type ObjectComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type ComputedPartialWorkspaceEntity } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const objectPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'labelIdentifierFieldMetadataId',
  'imageIdentifierFieldMetadataId',
  'isActive',
  'fields',
  'universalIdentifier',
  'applicationId',
];

@Injectable()
export class WorkspaceObjectComparator {
  constructor() {}

  public compare(
    originalObjectMetadata: Omit<ObjectMetadataEntity, 'fields'> | undefined,
    standardObjectMetadata: Omit<
      ComputedPartialWorkspaceEntity,
      'fields' | 'indexMetadatas'
    >,
  ): ObjectComparatorResult {
    // If the object doesn't exist in the original metadata, we need to create it
    if (!originalObjectMetadata) {
      return {
        action: ComparatorAction.CREATE,
        object: standardObjectMetadata,
      };
    }

    const objectPropertiesToUpdate: Partial<ComputedPartialWorkspaceEntity> =
      {};

    // Only compare properties that are not ignored
    const partialOriginalObjectMetadata = transformMetadataForComparison(
      originalObjectMetadata,
      {
        shouldIgnoreProperty: (property) =>
          objectPropertiesToIgnore.includes(property),
      },
    );

    // Compare objects
    const objectMetadataDifference = diff(
      partialOriginalObjectMetadata,
      omit(standardObjectMetadata, 'fields'),
    );

    // Loop through the differences and create an object with the properties to update
    for (const difference of objectMetadataDifference) {
      // We only handle CHANGE here as REMOVE and CREATE are handled earlier.
      if (difference.type === 'CHANGE') {
        // If the old value and the new value are both null, skip
        // Database is storing null, and we can get undefined here
        if (
          difference.oldValue === null &&
          (difference.value === null || difference.value === undefined)
        ) {
          continue;
        }

        const property = difference.path[0];

        // @ts-expect-error legacy noImplicitAny
        objectPropertiesToUpdate[property] = standardObjectMetadata[property];
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
