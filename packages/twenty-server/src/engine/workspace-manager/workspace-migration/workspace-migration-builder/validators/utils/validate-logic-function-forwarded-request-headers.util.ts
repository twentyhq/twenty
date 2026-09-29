import { msg, t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { isCredentialRequestHeaderName } from 'src/engine/metadata-modules/logic-function/utils/is-credential-request-header-name.util';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ValidateLogicFunctionForwardedRequestHeadersArgs = Partial<
  Pick<
    UniversalFlatLogicFunction,
    'httpRouteTriggerSettings' | 'serverRouteTriggerSettings'
  >
>;

const isArrayOfStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

export const validateLogicFunctionForwardedRequestHeaders = ({
  httpRouteTriggerSettings,
  serverRouteTriggerSettings,
}: ValidateLogicFunctionForwardedRequestHeadersArgs): FlatEntityValidationError<LogicFunctionExceptionCode>[] => {
  const forwardedRequestHeaderLists: unknown[] = [
    httpRouteTriggerSettings?.forwardedRequestHeaders,
    serverRouteTriggerSettings?.forwardedRequestHeaders,
  ].filter(isDefined);

  if (!forwardedRequestHeaderLists.every(isArrayOfStrings)) {
    return [
      {
        code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
        message: t`forwardedRequestHeaders must be an array of strings`,
        userFriendlyMessage: msg`Forwarded request headers must be a list of header names`,
      },
    ];
  }

  const forwardedCredentialHeaderNames = forwardedRequestHeaderLists
    .flat()
    .filter(isCredentialRequestHeaderName);

  if (!isNonEmptyArray(forwardedCredentialHeaderNames)) {
    return [];
  }

  const headerNames = forwardedCredentialHeaderNames.join(', ');

  return [
    {
      code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      message: t`forwardedRequestHeaders cannot include credential headers: ${headerNames}`,
      userFriendlyMessage: msg`Route triggers cannot forward credential headers`,
    },
  ];
};
