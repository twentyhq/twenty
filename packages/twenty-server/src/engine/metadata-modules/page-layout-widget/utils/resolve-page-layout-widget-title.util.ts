import { type I18n } from '@lingui/core';

import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

export const resolvePageLayoutWidgetTitle = ({
  title,
  applicationId,
  twentyStandardApplicationId,
  overrides,
  i18nInstance,
}: {
  title: string;
  applicationId: string;
  twentyStandardApplicationId: string;
  overrides?: PageLayoutWidgetOverrides | null;
  i18nInstance: I18n;
}): string => {
  if (applicationId !== twentyStandardApplicationId) {
    return title;
  }

  if (isDefined(overrides?.title)) {
    return title;
  }

  const messageId = generateMessageId(title);
  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return title;
  }

  return translatedMessage;
};
