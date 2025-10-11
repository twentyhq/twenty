import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';

import { FLAT_ROUTE_TRIGGER_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/route-trigger/constants/flat-route-trigger-properties-to-compare.constant';
import { type FlatRouteTriggerPropertiesToCompare } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger-properties-to-compare.type';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { type UpdateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-trigger-action-v2.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateRouteTriggerActionArgs = FromTo<
  FlatRouteTrigger,
  'FlatRouteTrigger'
>;

export const compareTwoFlatRouteTrigger = ({
  fromFlatRouteTrigger,
  toFlatRouteTrigger,
}: GetWorkspaceMigrationUpdateRouteTriggerActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_ROUTE_TRIGGER_PROPERTIES_TO_COMPARE.includes(
        property as FlatRouteTriggerPropertiesToCompare,
      ),
    propertiesToStringify: [] as const,
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatRouteTrigger,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatRouteTrigger,
    transformMetadataForComparisonParameters,
  );

  const flatRouteTriggerDifferences = diff(fromCompare, toCompare);

  return flatRouteTriggerDifferences.flatMap<
    UpdateRouteTriggerAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatRouteTriggerPropertiesToCompare;

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
  });
};
