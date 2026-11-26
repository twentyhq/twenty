import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined, printValidationRuleExpression } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildDatabaseEventTriggerConditionFields } from 'src/engine/workspace-event-emitter/utils/build-database-event-trigger-condition-fields.util';

// Clients read and write conditions as text, so the stored tree is printed with the current field names
export const printDatabaseEventTriggerSettings = ({
  settings,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  settings: DatabaseEventTriggerSettings;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): DatabaseEventTriggerSettings => {
  const { conditionTree, ...printedSettings } = settings;

  if (!isDefined(conditionTree)) {
    return printedSettings;
  }

  const condition = printValidationRuleExpression({
    tree: conditionTree,
    fields:
      buildDatabaseEventTriggerConditionFields({
        eventName: settings.eventName,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        shouldIncludeInactiveFields: true,
      }) ?? [],
  });

  return { ...printedSettings, ...(isDefined(condition) && { condition }) };
};
