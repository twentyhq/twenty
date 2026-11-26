import { isNonEmptyString } from '@sniptt/guards';
import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compileValidationRuleTree } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-tree.util';
import { buildDatabaseEventTriggerConditionFields } from 'src/engine/workspace-event-emitter/utils/build-database-event-trigger-condition-fields.util';
import { printDatabaseEventTriggerSettings } from 'src/engine/workspace-event-emitter/utils/print-database-event-trigger-settings.util';

// Settings validation sees no object metadata, so conditions are compiled where triggers are written
export const computeDatabaseEventTriggerSettingsOrThrow = ({
  settings,
  storedSettings = [],
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  throwInvalidCondition,
}: {
  settings: DatabaseEventTriggerSettings;
  storedSettings?: DatabaseEventTriggerSettings[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  throwInvalidCondition: (invalidCondition: {
    condition: string;
    reason: string;
  }) => never;
}): DatabaseEventTriggerSettings => {
  const {
    condition,
    conditionTree: _conditionTree,
    ...settingsWithoutCondition
  } = settings;

  if (!isNonEmptyString(condition)) {
    return settingsWithoutCondition;
  }

  // A stored condition whose field was later deleted must not block unrelated edits
  const unchangedStoredSettings = storedSettings.find((stored) => {
    const printedStoredSettings = printDatabaseEventTriggerSettings({
      settings: stored,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    return (
      printedStoredSettings.eventName === settings.eventName &&
      printedStoredSettings.condition === condition
    );
  });

  if (isDefined(unchangedStoredSettings)) {
    const { conditionTree, condition: storedCondition } =
      unchangedStoredSettings;

    return {
      ...settingsWithoutCondition,
      ...(isDefined(conditionTree)
        ? { conditionTree }
        : { condition: storedCondition }),
    };
  }

  const fields = buildDatabaseEventTriggerConditionFields({
    eventName: settings.eventName,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  if (!isDefined(fields)) {
    return throwInvalidCondition({
      condition,
      reason: 'a condition needs a trigger on one known object',
    });
  }

  const compilation = compileValidationRuleTree({
    expression: condition,
    fields,
  });

  if (!compilation.isValid) {
    return throwInvalidCondition({
      condition,
      reason: compilation.errorMessage,
    });
  }

  return { ...settingsWithoutCondition, conditionTree: compilation.tree };
};
