import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateIframeUrl = ({
  iframeUniversalConfiguration,
  widgetTitle,
}: {
  iframeUniversalConfiguration: UniversalFlatPageLayoutWidget<WidgetConfigurationType.IFRAME>['universalConfiguration'];
  widgetTitle: string;
}): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (
    isDefined(iframeUniversalConfiguration.url) &&
    typeof iframeUniversalConfiguration.url !== 'string'
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`URL must be a string for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`URL must be a string`,
      value: iframeUniversalConfiguration.url,
    });
  }

  return errors;
};
