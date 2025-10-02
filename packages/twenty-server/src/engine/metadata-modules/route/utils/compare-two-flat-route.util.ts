import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FLAT_ROUTE_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/route/constants/flat-route-properties-to-compare.constant';
import { type FlatRoutePropertiesToCompare } from 'src/engine/metadata-modules/route/types/flat-route-properties-to-compare.type';
import { type FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';
import { type UpdateRouteAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-action-v2.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateRouteActionArgs = FromTo<
  FlatRoute,
  'FlatRoute'
>;

export const compareTwoFlatRoute = ({
  fromFlatRoute,
  toFlatRoute,
}: GetWorkspaceMigrationUpdateRouteActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_ROUTE_PROPERTIES_TO_COMPARE.includes(
        property as FlatRoutePropertiesToCompare,
      ),
    propertiesToStringify: [] as const,
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatRoute,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatRoute,
    transformMetadataForComparisonParameters,
  );

  const flatRouteDifferences = diff(fromCompare, toCompare);

  return flatRouteDifferences.flatMap<UpdateRouteAction['updates'][number]>(
    (difference) => {
      switch (difference.type) {
        case 'CHANGE': {
          const { oldValue, path, value } = difference;
          const property = path[0] as FlatRoutePropertiesToCompare;

          return {
            from: oldValue,
            to: value,
            property,
          };
        }
        case 'CREATE':
        case 'REMOVE':
        default: {
          // Should never occurs, we should only provide null never undefined and so on
          return [];
        }
      }
    },
  );
};
