import { type I18n } from '@lingui/core';

import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type PageLayoutTabOverrides } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';

export const resolvePageLayoutTabTitle = ({
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
  overrides?: PageLayoutTabOverrides | null;
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
