import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validatePieChartConfiguration = ({
  graphUniversalConfiguration,
  widgetTitle,
}: {
  graphUniversalConfiguration: UniversalFlatPageLayoutWidget<WidgetConfigurationType.PIE_CHART>['universalConfiguration'];
  widgetTitle: string;
}): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (
    !isDefined(
      graphUniversalConfiguration.groupByFieldMetadataUniversalIdentifier,
    )
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Group by field is required for pie chart widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Group by field is required for pie chart`,
    });
  }

  return errors;
};
