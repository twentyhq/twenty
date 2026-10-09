import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isHttpsUrl } from 'src/engine/core-modules/application/application-registration/utils/is-https-url.util';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type UniversalFlatLogicFunction } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-logic-function.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const isHttpsUrlValue = (value: unknown): boolean =>
  isNonEmptyString(value) && isHttpsUrl(value);

export const validateLogicFunctionBearerTokenVerification = ({
  serverRouteTriggerSettings,
}: Partial<
  Pick<UniversalFlatLogicFunction, 'serverRouteTriggerSettings'>
>): FlatEntityValidationError<LogicFunctionExceptionCode>[] => {
  const bearerTokenVerification: unknown =
    serverRouteTriggerSettings?.bearerTokenVerification;

  if (!isDefined(bearerTokenVerification)) {
    return [];
  }

  if (
    isPlainObject(bearerTokenVerification) &&
    isHttpsUrlValue(bearerTokenVerification.jwksUrl) &&
    isNonEmptyString(bearerTokenVerification.issuer) &&
    isNonEmptyString(bearerTokenVerification.audienceServerVariable) &&
    (!isDefined(bearerTokenVerification.requiredKeyEndorsement) ||
      isNonEmptyString(bearerTokenVerification.requiredKeyEndorsement))
  ) {
    return [];
  }

  return [
    {
      code: LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
      message: t`bearerTokenVerification needs an https jwksUrl, an issuer and an audienceServerVariable`,
      userFriendlyMessage: msg`Bearer token verification settings are invalid`,
    },
  ];
};
