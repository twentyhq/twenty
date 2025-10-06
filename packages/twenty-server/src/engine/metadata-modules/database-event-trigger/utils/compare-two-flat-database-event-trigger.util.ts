import diff from 'microdiff';
import { type FromTo } from 'twenty-shared/types';
import { parseJson } from 'twenty-shared/utils';

import { FLAT_DATABASE_EVENT_TRIGGER_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/database-event-trigger/constants/flat-database-event-trigger-properties-to-compare.constant';
import { type DatabaseEventTriggerSettings } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type FlatDatabaseEventTriggerPropertiesToCompare } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger-properties-to-compare.type';
import { type FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { type UpdateDatabaseEventTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-database-event-trigger-action-v2.type';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';

type GetWorkspaceMigrationUpdateDatabaseEventTriggerActionArgs = FromTo<
  FlatDatabaseEventTrigger,
  'FlatDatabaseEventTrigger'
>;

export const compareTwoFlatDatabaseEventTrigger = ({
  fromFlatDatabaseEventTrigger,
  toFlatDatabaseEventTrigger,
}: GetWorkspaceMigrationUpdateDatabaseEventTriggerActionArgs) => {
  const transformMetadataForComparisonParameters = {
    shouldIgnoreProperty: (property: string) =>
      !FLAT_DATABASE_EVENT_TRIGGER_PROPERTIES_TO_COMPARE.includes(
        property as FlatDatabaseEventTriggerPropertiesToCompare,
      ),
    propertiesToStringify: ['settings'] as const,
  };
  const fromCompare = transformMetadataForComparison(
    fromFlatDatabaseEventTrigger,
    transformMetadataForComparisonParameters,
  );
  const toCompare = transformMetadataForComparison(
    toFlatDatabaseEventTrigger,
    transformMetadataForComparisonParameters,
  );

  const flatDatabaseEventTriggerDifferences = diff(fromCompare, toCompare);

  return flatDatabaseEventTriggerDifferences.flatMap<
    UpdateDatabaseEventTriggerAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        const { oldValue, path, value } = difference;
        const property = path[0] as FlatDatabaseEventTriggerPropertiesToCompare;

        if (property === 'settings') {
          return {
            from: parseJson(oldValue) as DatabaseEventTriggerSettings,
            to: parseJson(value) as DatabaseEventTriggerSettings,
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
