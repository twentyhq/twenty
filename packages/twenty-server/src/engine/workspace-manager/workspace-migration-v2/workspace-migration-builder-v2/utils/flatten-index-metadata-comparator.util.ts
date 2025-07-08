import diff from 'microdiff';

import { FlattenIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flatten-index-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const flattenedIndexMetadataPropertiesToCompare = [
  'flattenIndexFieldMetadatas', // Comparing this as whole ? should iterate on each keys ? => TBD should only map over cols as before ?
  'indexType',
  'indexWhereClause',
  'isUnique',
  'name',
] as const satisfies (keyof FlattenIndexMetadata)[];
type FlattenedIndexMetadataPropertiesToCompare =
  (typeof flattenedIndexMetadataPropertiesToCompare)[number];

// Should also handle indexFieldMetadata comparison ?
export const compareTwoFlattenedIndexMetadata = ({
  from,
  to,
}: FromTo<FlattenIndexMetadata>) => {
  const transformOptions = {
    shouldIgnoreProperty: (property: string) =>
      !flattenedIndexMetadataPropertiesToCompare.includes(
        property as FlattenedIndexMetadataPropertiesToCompare,
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
