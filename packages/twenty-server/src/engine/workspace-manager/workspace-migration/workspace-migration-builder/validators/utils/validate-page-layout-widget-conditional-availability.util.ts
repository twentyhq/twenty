import { type MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type ConditionalAvailabilityCheckError } from 'twenty-shared/types';
import {
  assertUnreachable,
  checkConditionalAvailabilityNode,
} from 'twenty-shared/utils';

import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const getUserFriendlyMessage = (
  failure: ConditionalAvailabilityCheckError,
): MessageDescriptor => {
  switch (failure.errorCode) {
    case 'RULE_TOO_LARGE':
      return msg`Visibility restriction has too many conditions`;
    case 'UNKNOWN_NAME': {
      const { name } = failure.errorParams;

      return msg`"${name}" cannot be used in this visibility restriction`;
    }
    case 'INVALID_NODE':
      return msg`Visibility restriction cannot be read`;
    default:
      return assertUnreachable(failure);
  }
};

export const validatePageLayoutWidgetConditionalAvailability = ({
  conditionalAvailability,
}: {
  conditionalAvailability: unknown;
}): FlatEntityValidationError<PageLayoutWidgetExceptionCode>[] => {
  const checkResult = checkConditionalAvailabilityNode({
    node: conditionalAvailability,
    metadataName: 'pageLayoutWidget',
  });

  if (checkResult.isValid) {
    return [];
  }

  const diagnostic = doNotTranslate(checkResult.errorMessage);

  return [
    {
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid visibility restriction: ${diagnostic}`,
      userFriendlyMessage: getUserFriendlyMessage(checkResult),
      value: checkResult,
    },
  ];
};
