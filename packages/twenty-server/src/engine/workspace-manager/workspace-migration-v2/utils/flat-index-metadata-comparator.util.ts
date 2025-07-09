import diff from 'microdiff';

import { FlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-index-metadata';
import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/from-to.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

const flatIndexMetadataPropertiesToCompare = [
  'flatIndexFieldMetadatas', // Comparing this as whole ? should iterate on each keys ? => TBD should only map over cols as before ?
  'indexType',
  'indexWhereClause',
  'isUnique',
  'name',
] as const satisfies (keyof FlatIndexMetadata)[];

type FlatIndexMetadataPropertiesToCompare =
  (typeof flatIndexMetadataPropertiesToCompare)[number];

// Should also handle indexFieldMetadata comparison ?
export const compareTwoFlatIndexMetadata = ({
  from,
  to,
}: FromTo<FlatIndexMetadata>) => {
  const transformOptions = {
    shouldIgnoreProperty: (property: string) =>
      !flatIndexMetadataPropertiesToCompare.includes(
        property as FlatIndexMetadataPropertiesToCompare,
      ),
  };

  const fromCompare = transformMetadataForComparison(from, transformOptions);
  const toCompare = transformMetadataForComparison(to, transformOptions);

  const flatIndexeDifferences = diff(fromCompare, toCompare);

  return flatIndexeDifferences.flatMap<{ property: string } & FromTo<unknown>>(
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
