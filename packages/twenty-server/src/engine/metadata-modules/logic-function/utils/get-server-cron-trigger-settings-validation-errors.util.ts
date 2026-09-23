import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CronExpressionParser } from 'cron-parser';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';

export type LogicFunctionTriggerSettings = Pick<
  UniversalFlatLogicFunction,
  | 'cronTriggerSettings'
  | 'databaseEventTriggerSettings'
  | 'httpRouteTriggerSettings'
  | 'serverRouteTriggerSettings'
  | 'serverCronTriggerSettings'
  | 'toolTriggerSettings'
  | 'workflowActionTriggerSettings'
>;

const SERVER_CRON_PATTERN_FIELD_COUNT = 5;

const isValidServerCronPattern = (pattern: unknown): boolean => {
  if (!isNonEmptyString(pattern)) {
    return false;
  }

  if (pattern.trim().split(/\s+/).length !== SERVER_CRON_PATTERN_FIELD_COUNT) {
    return false;
  }

  try {
    CronExpressionParser.parse(pattern, { tz: 'UTC' });

    return true;
  } catch {
    return false;
  }
};

export const getServerCronTriggerSettingsValidationErrors = ({
  serverCronTriggerSettings,
  cronTriggerSettings,
  databaseEventTriggerSettings,
  httpRouteTriggerSettings,
  serverRouteTriggerSettings,
  toolTriggerSettings,
  workflowActionTriggerSettings,
}: LogicFunctionTriggerSettings): FlatEntityValidationError[] => {
  if (!isDefined(serverCronTriggerSettings)) {
    return [];
  }

  const errors: FlatEntityValidationError[] = [];

  if (!isValidServerCronPattern(serverCronTriggerSettings.pattern)) {
    errors.push({
      code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      message: t`Server cron trigger pattern must be a valid cron expression with exactly 5 fields`,
      userFriendlyMessage: msg`Server cron trigger pattern is invalid`,
      value: serverCronTriggerSettings.pattern,
    });
  }

  const hasOtherTrigger = [
    cronTriggerSettings,
    databaseEventTriggerSettings,
    httpRouteTriggerSettings,
    serverRouteTriggerSettings,
    toolTriggerSettings,
    workflowActionTriggerSettings,
  ].some(isDefined);

  if (hasOtherTrigger) {
    errors.push({
      code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      message: t`Server cron trigger cannot be combined with another trigger`,
      userFriendlyMessage: msg`Server cron trigger cannot be combined with another trigger`,
    });
  }

  return errors;
};
