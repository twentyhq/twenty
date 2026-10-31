import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateLogicFunctionServerRouteApplication = ({
  applicationUniversalIdentifier,
  serverRouteTriggerSettings,
  workspaceCustomApplicationUniversalIdentifier,
}: Partial<
  Pick<
    UniversalFlatLogicFunction,
    'applicationUniversalIdentifier' | 'serverRouteTriggerSettings'
  >
> & {
  workspaceCustomApplicationUniversalIdentifier: string;
}): FlatEntityValidationError<LogicFunctionExceptionCode>[] => {
  if (
    !isDefined(serverRouteTriggerSettings) ||
    applicationUniversalIdentifier !==
      workspaceCustomApplicationUniversalIdentifier
  ) {
    return [];
  }

  return [
    {
      code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      message: t`serverRouteTriggerSettings can only be set by an installed application`,
      userFriendlyMessage: msg`Server routes can only be defined by an application.`,
    },
  ];
};
