import { msg, t } from '@lingui/core/macro';
import {
  CRON_TRIGGER_MAX_SPREAD_MS,
  CRON_TRIGGER_MIN_SPREAD_MS,
  isValidCronTriggerSpreadMs,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateLogicFunctionCronTriggerSpread = ({
  cronTriggerSettings,
}: Partial<
  Pick<UniversalFlatLogicFunction, 'cronTriggerSettings'>
>): FlatEntityValidationError<LogicFunctionExceptionCode>[] => {
  if (
    !isDefined(cronTriggerSettings?.spreadMs) ||
    isValidCronTriggerSpreadMs(cronTriggerSettings.spreadMs)
  ) {
    return [];
  }

  return [
    {
      code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      message: t`Cron trigger spreadMs must be an integer between ${CRON_TRIGGER_MIN_SPREAD_MS} and ${CRON_TRIGGER_MAX_SPREAD_MS}`,
      userFriendlyMessage: msg`Cron trigger spread must be between 2 minutes and 24 hours.`,
    },
  ];
};
