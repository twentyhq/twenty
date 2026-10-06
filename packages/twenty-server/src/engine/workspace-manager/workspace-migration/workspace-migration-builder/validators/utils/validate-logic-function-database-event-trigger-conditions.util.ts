import { msg, t } from '@lingui/core/macro';
import {
  type DatabaseEventTriggerSettings,
  validateDatabaseEventTriggerConditions,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateLogicFunctionDatabaseEventTriggerConditions = (
  databaseEventTriggerSettings: DatabaseEventTriggerSettings | null | undefined,
): FlatEntityValidationError<LogicFunctionExceptionCode>[] => {
  if (
    !isDefined(databaseEventTriggerSettings) ||
    !isDefined(databaseEventTriggerSettings.conditions)
  ) {
    return [];
  }

  return validateDatabaseEventTriggerConditions({
    eventName: databaseEventTriggerSettings.eventName,
    conditions: databaseEventTriggerSettings.conditions,
  }).map((error) => ({
    code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
    message: t`Invalid database event trigger conditions: ${error}`,
    userFriendlyMessage: msg`Database event trigger conditions are invalid`,
  }));
};
