import { type I18n } from '@lingui/core';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const resolvePageLayoutWidgetTitle = ({
  title,
  applicationId,
  pageLayoutType,
  i18nInstance,
}: {
  title: string;
  applicationId: string;
  pageLayoutType: PageLayoutType;
  i18nInstance: I18n;
}): string => {
  if (pageLayoutType !== PageLayoutType.RECORD_PAGE) {
    return title;
  }

  if (applicationId !== TWENTY_STANDARD_APPLICATION.universalIdentifier) {
    return title;
  }

  const messageId = generateMessageId(title);
  const translatedMessage = i18nInstance._(messageId);

  if (translatedMessage === messageId) {
    return title;
  }

  return translatedMessage;
};
