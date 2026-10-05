import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ValidateLogicFunctionDatabaseEventTriggerSettingsArgs = Partial<
  Pick<UniversalFlatLogicFunction, 'databaseEventTriggerSettings'>
>;

const isDatabaseEventTrigger = (value: unknown): boolean =>
  isPlainObject(value) &&
  isNonEmptyString((value as { eventName?: unknown }).eventName);

export const validateLogicFunctionDatabaseEventTriggerSettings = ({
  databaseEventTriggerSettings,
}: ValidateLogicFunctionDatabaseEventTriggerSettingsArgs): FlatEntityValidationError<LogicFunctionExceptionCode>[] => {
  if (!isDefined(databaseEventTriggerSettings)) {
    return [];
  }

  if (
    !Array.isArray(databaseEventTriggerSettings) ||
    !databaseEventTriggerSettings.every(isDatabaseEventTrigger)
  ) {
    return [
      {
        code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
        message: t`databaseEventTriggerSettings must be an array of triggers, each with an eventName`,
        userFriendlyMessage: msg`Each database event trigger needs an event name`,
      },
    ];
  }

  return [];
};
