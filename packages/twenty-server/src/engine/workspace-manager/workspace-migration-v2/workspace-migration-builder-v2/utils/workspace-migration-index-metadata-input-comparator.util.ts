import diff from 'microdiff';

import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import {
  FlattenedIndexMetadata,
  IndexMetadataEntityEditableProperties,
  indexMetadataEntityPropertiesToCompare,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-index-input';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

// Should also handle indexFieldMetadata comparison ?
export const compareTwoFlattenedIndexMetadata = ({
  from,
  to,
}: FromTo<FlattenedIndexMetadata>) => {
  const transformOptions = {
    shouldIgnoreProperty: (property: string) =>
      !indexMetadataEntityPropertiesToCompare.includes(
        property as IndexMetadataEntityEditableProperties,
      ),
  };

  const fromCompare = transformMetadataForComparison(from, transformOptions);
  const toCompare = transformMetadataForComparison(to, transformOptions);

  const indexesDifferences = diff(fromCompare, toCompare);

  return indexesDifferences.flatMap<{ property: string } & FromTo<unknown>>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;

          const property = path[0];

          if (typeof property === 'number') {
            return [];
          }

          return {
            from: oldValue,
            property,
            to: value,
          };
        }
        case 'CREATE':
        case 'REMOVE':
        default:
          return [];
      }
    },
  );
};
