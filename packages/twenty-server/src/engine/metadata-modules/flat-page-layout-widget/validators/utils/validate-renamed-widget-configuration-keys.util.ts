import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { RENAMED_WIDGET_CONFIGURATION_KEYS } from 'src/engine/metadata-modules/flat-page-layout-widget/constants/renamed-widget-configuration-keys.constant';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateRenamedWidgetConfigurationKeys = (
  flatPageLayoutWidget: FlatPageLayoutWidget,
): FlatPageLayoutWidgetValidationError[] => {
  const { universalConfiguration, title: widgetTitle } = flatPageLayoutWidget;

  if (!isDefined(universalConfiguration)) {
    return [];
  }

  const renamedKeys =
    RENAMED_WIDGET_CONFIGURATION_KEYS[universalConfiguration.configurationType];

  if (!isDefined(renamedKeys)) {
    return [];
  }

  return Object.entries(renamedKeys)
    .filter(([formerKey]) => formerKey in universalConfiguration)
    .map(([formerKey, currentKey]) => ({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration key "${formerKey}" of widget "${widgetTitle}" was renamed to "${currentKey}"`,
      userFriendlyMessage: msg`Configuration key "${formerKey}" was renamed to "${currentKey}"`,
      value: formerKey,
    }));
};
