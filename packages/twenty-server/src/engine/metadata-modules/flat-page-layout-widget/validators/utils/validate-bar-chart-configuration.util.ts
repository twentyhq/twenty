import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type BarChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/bar-chart-configuration.validation-schema';

export const validateBarChartConfiguration = (
  configuration: BarChartConfigurationValidationSchema,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.primaryAxisGroupByFieldMetadataId)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Primary axis group by field is required for bar chart widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Primary axis group by field is required for bar chart`,
    });
  }

  if (!isDefined(configuration.layout)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Layout is required for bar chart widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Layout is required for bar chart`,
    });
  }

  return errors;
};
