import { type MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';
import {
  type ConditionalAvailabilityValidationResult,
  validateConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { doNotTranslate } from 'twenty-shared/i18n';
import { assertUnreachable } from 'twenty-shared/utils';

import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const getConditionalAvailabilityUserFriendlyMessage = (
  failedValidationResult: Extract<
    ConditionalAvailabilityValidationResult,
    { isValid: false }
  >,
): MessageDescriptor => {
  switch (failedValidationResult.errorCode) {
    case 'RULE_TOO_LARGE':
      return msg`Visibility restriction has too many conditions`;
    case 'UNKNOWN_NAME': {
      const { name } = failedValidationResult.errorParams;

      return msg`"${name}" cannot be used in this visibility restriction`;
    }
    case 'INVALID_NODE':
      return msg`Visibility restriction cannot be read`;
    default:
      return assertUnreachable(failedValidationResult);
  }
};

export const validatePageLayoutWidgetConditionalAvailability = ({
  conditionalAvailability,
}: {
  conditionalAvailability: unknown;
}): FlatEntityValidationError<PageLayoutWidgetExceptionCode>[] => {
  const validationResult = validateConditionalAvailabilityNode({
    node: conditionalAvailability,
    metadataName: 'pageLayoutWidget',
  });

  if (validationResult.isValid) {
    return [];
  }

  const untranslatedErrorMessage = doNotTranslate(
    validationResult.errorMessage,
  );

  return [
    {
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid visibility restriction: ${untranslatedErrorMessage}`,
      userFriendlyMessage:
        getConditionalAvailabilityUserFriendlyMessage(validationResult),
      value: validationResult,
    },
  ];
};
