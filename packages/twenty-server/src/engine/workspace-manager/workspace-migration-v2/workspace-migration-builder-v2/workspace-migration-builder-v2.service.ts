import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import diff from 'microdiff';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-v2';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

@Injectable()
export class WorkspaceMigrationBuilderV2Service {
  constructor() {}

  build(
    from: WorkspaceMigrationObjectInput,
    to: WorkspaceMigrationObjectInput,
  ): WorkspaceMigrationV2[] {
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

    const partialFrom = transformMetadataForComparison(from, {
      shouldIgnoreProperty: (property) =>
        objectPropertiesToIgnore.includes(property),
    });
    const partialTo = transformMetadataForComparison(to, {
      shouldIgnoreProperty: (property) =>
        objectPropertiesToIgnore.includes(property),
    });

    const objectMetadataDifference = diff(
      partialFrom,
      omit(partialTo, 'fields'),
    );

    const objectPropertiesToUpdate: Partial<WorkspaceMigrationObjectInput> = {};

    for (const difference of objectMetadataDifference) {
      if (difference.type === 'CHANGE') {
        if (
          difference.oldValue === null &&
          (difference.value === null || difference.value === undefined)
        ) {
          continue;
        }
        const property = difference.path[0];

        // @ts-expect-error legacy noImplicitAny
        objectPropertiesToUpdate[property] = to[property];
      }
    }

    if (Object.keys(objectPropertiesToUpdate).length > 0) {
      // Only include properties that exist on ObjectMetadataEntity and are relevant for update
      const allowedObjectProps: (keyof Partial<ObjectMetadataEntity>)[] = [
        'nameSingular',
        'namePlural',
        'labelSingular',
        'labelPlural',
        'description',
      ];
      const filteredObjectPropertiesToUpdate: Partial<ObjectMetadataEntity> =
        {};

      for (const key of allowedObjectProps) {
        if (key in objectPropertiesToUpdate) {
          // @ts-expect-error legacy noImplicitAny
          filteredObjectPropertiesToUpdate[key] =
            objectPropertiesToUpdate[
              key as keyof WorkspaceMigrationObjectInput
            ];
        }
      }
      actions.push({
        type: 'update_object',
        object: filteredObjectPropertiesToUpdate,
      });
    }

    if (actions.length === 0) return [];

    return [{ actions }];
  }
}
