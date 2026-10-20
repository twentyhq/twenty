import { msg } from '@lingui/core/macro';
import {
  findMalformedTemplateVariable,
  isDefined,
  parseTemplateVariableWithFallback,
  TEMPLATE_VARIABLE_PATTERN,
} from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';

export const collectCampaignVariableNamesFromStringOrThrow = (
  value: unknown,
): Set<string> => {
  const names = new Set<string>();

  if (typeof value !== 'string') {
    return names;
  }

  const malformedTemplateVariable = findMalformedTemplateVariable(value);

  if (isDefined(malformedTemplateVariable)) {
    const expectedSyntax = '{{jobTitle}} or {{jobTitle | default: "there"}}';

    throw new EmailingDomainException(
      `Malformed campaign variable: ${malformedTemplateVariable}. Expected ${expectedSyntax}`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      {
        userFriendlyMessage: msg`This campaign has a variable written in the wrong format: ${malformedTemplateVariable}. Write it as ${expectedSyntax}.`,
      },
    );
  }

  for (const [rawTemplateVariable] of value.matchAll(
    TEMPLATE_VARIABLE_PATTERN,
  )) {
    const campaignVariable =
      parseTemplateVariableWithFallback(rawTemplateVariable);

    if (isDefined(campaignVariable)) {
      names.add(campaignVariable.name);
    }
  }

  return names;
};
