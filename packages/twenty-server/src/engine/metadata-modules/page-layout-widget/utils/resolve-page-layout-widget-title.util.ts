import { type I18n } from '@lingui/core';

import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

export const resolvePageLayoutWidgetTitle = ({
  title,
  applicationId,
  twentyStandardApplicationId,
  overrides,
  i18nInstance,
  applicationCatalog,
}: {
  title: string;
  applicationId: string;
  twentyStandardApplicationId: string;
  overrides?: PageLayoutWidgetOverrides | null;
  i18nInstance: I18n;
  applicationCatalog?: Record<string, string>;
}): string => {
  const isStandardApp = applicationId === twentyStandardApplicationId;

  if (isDefined(overrides?.title)) {
    return title;
  }

  return translateStandardLabel({
    sourceValue: title,
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};
