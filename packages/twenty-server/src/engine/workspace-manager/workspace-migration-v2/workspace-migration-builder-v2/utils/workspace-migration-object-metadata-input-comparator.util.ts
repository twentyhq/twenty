import omit from 'lodash.omit';
import diff from 'microdiff';
import { assertUnreachable } from 'twenty-shared/utils';

import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-action-v2';
import {
  ObjectMetadataEntityEditableProperties,
  WorkspaceMigrationObjectInput,
  objectMetadataEntityEditableProperties,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type ObjectWorkspaceMigrationUpdate = FromTo<WorkspaceMigrationObjectInput>;

export const compareTwoWorkspaceMigrationObjectInput = ({
  from,
  to,
}: ObjectWorkspaceMigrationUpdate) => {
  const fromCompare = transformMetadataForComparison(from, {});
  const toCompare = transformMetadataForComparison(to, {});
  const objectMetadataDifference = diff(fromCompare, omit(toCompare, 'fields'));

  return objectMetadataDifference.flatMap<
    UpdateObjectAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        if (
          difference.oldValue === null &&
          (difference.value === null || difference.value === undefined)
        ) {
          return [];
        }
        const property = difference.path[0];

        // TODO investigate why it would be a number, in case of array I guess ?
        if (typeof property === 'number') {
          return [];
        }

        // Could be handled directly from the diff we do above
        if (
          !objectMetadataEntityEditableProperties.includes(
            property as ObjectMetadataEntityEditableProperties,
          )
        ) {
          return [];
        }

        return {
          property: property as ObjectMetadataEntityEditableProperties,
          from: difference.oldValue,
          to: difference.value,
        };
      }
      case 'CREATE':
      case 'REMOVE': {
        // Should never occurs ? should throw ?
        return [];
      }
      default: {
        assertUnreachable(
          difference,
          `Unexpected difference type: ${difference['type']}`,
        );
      }
    }
  });
};
