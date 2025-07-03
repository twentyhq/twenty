import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import diff from 'microdiff';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  UpdateObjectAction,
  WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type WorkspaceMigrationBuilderV2ServiceArgs = {
  from: WorkspaceMigrationObjectInput;
  to: WorkspaceMigrationObjectInput;
};
@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build({
    from,
    to,
  }: WorkspaceMigrationBuilderV2ServiceArgs): WorkspaceMigrationV2[] {
    const actions: WorkspaceMigrationActionV2[] = [];

    const objectPropertiesToIgnore = [
      'id',
      'createdAt',
      'updatedAt',
      'labelIdentifierFieldMetadataId',
      'imageIdentifierFieldMetadataId',
      'isActive',
      'fields',
    ];

    const fromCompare = transformMetadataForComparison(from, {
      shouldIgnoreProperty: (property) =>
        objectPropertiesToIgnore.includes(property),
    });
    const toCompare = transformMetadataForComparison(to, {
      shouldIgnoreProperty: (property) =>
        objectPropertiesToIgnore.includes(property),
    });

    const objectMetadataDifference = diff(
      fromCompare,
      omit(toCompare, 'fields'),
    );

    const objectPropertiesToUpdate: UpdateObjectAction['object'] = {
      from: {},
      to: {},
    };

    const allowedObjectProps: (keyof Partial<ObjectMetadataEntity>)[] = [
      'nameSingular',
      'namePlural',
      'labelSingular',
      'labelPlural',
      'description',
    ];

    const objectUpdatedProperties = objectMetadataDifference.reduce(
      (acc, difference) => {
        switch (difference.type) {
          case 'CHANGE': {
            if (
              difference.oldValue === null &&
              (difference.value === null || difference.value === undefined)
            ) {
              return acc;
            }
            const property = difference.path[0];

            // TODO investigate why it would be a number, in case of array I guess ?
            if (typeof property === 'number') {
              return acc;
            }

            // Could be handled directly from the diff we do above
            if (
              !allowedObjectProps.includes(
                property as keyof ObjectMetadataEntity,
              )
            ) {
              return acc;
            }

            return {
              from: difference.oldValue,
              to: difference.value,
            };
          }
          case 'CREATE':
          case 'REMOVE':
          default: {
            return acc;
          }
        }
      },
      objectPropertiesToUpdate,
    );

    if (Object.keys(objectUpdatedProperties).length > 0) {
      actions.push({
        type: 'update_object',
        object: objectUpdatedProperties,
      });
    }

    if (actions.length === 0) return [];

    return [{ actions }];
  }
}
