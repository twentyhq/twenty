import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { FLAT_CRON_TRIGGER_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/cron-trigger/constants/flat-cron-trigger-properties-to-compare.constant';
import { type CronTriggerSettings } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { type FlatCronTriggerPropertiesToCompare } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger-properties-to-compare.type';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { type UpdateCronTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-cron-trigger-action-v2.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateCronTriggerActionArgs = FromTo<
  FlatCronTrigger,
  'FlatCronTrigger'
>;

export const compareTwoFlatCronTrigger = ({
  fromFlatCronTrigger,
  toFlatCronTrigger,
}: GetWorkspaceMigrationUpdateCronTriggerActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_CRON_TRIGGER_PROPERTIES_TO_COMPARE.includes(
        property as FlatCronTriggerPropertiesToCompare,
      ),
    propertiesToStringify: ['settings'] as const,
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatCronTrigger,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatCronTrigger,
    transformMetadataForComparisonParameters,
  );

  const flatCronTriggerDifferences = diff(fromCompare, toCompare);

  return flatCronTriggerDifferences.flatMap<
    UpdateCronTriggerAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatCronTriggerPropertiesToCompare;

        if (property === 'settings') {
          return {
            from: parseJson(oldValue) as CronTriggerSettings,
            to: parseJson(value) as CronTriggerSettings,
            property,
          };
        }

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
