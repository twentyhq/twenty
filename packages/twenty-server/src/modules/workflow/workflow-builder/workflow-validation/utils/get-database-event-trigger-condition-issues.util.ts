import { isNonEmptyString } from '@sniptt/guards';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';
import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

// A wildcard trigger compiles its condition per object when an event arrives
export const getDatabaseEventTriggerConditionIssues = ({
  trigger,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
}: {
  trigger: WorkflowTrigger | null;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
}): WorkflowValidationIssue[] => {
  if (trigger?.type !== WorkflowTriggerType.DATABASE_EVENT) {
    return [];
  }

  const { condition, eventName } = trigger.settings;

  if (!isNonEmptyString(condition)) {
    return [];
  }

  const objectMetadataId = objectIdByNameSingular[eventName.split('.')[0]];

  if (!isDefined(objectMetadataId)) {
    return [];
  }

  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
  });

  return compilation.isValid
    ? []
    : [
        {
          severity: 'error',
          code: 'INVALID_TRIGGER_PARAMS',
          message: `The trigger condition is invalid: ${compilation.errorMessage}`,
          path: 'settings.condition',
        },
      ];
};
