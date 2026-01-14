import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type BaseGraphConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/types/base-graph-configuration.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateBaseGraphFields = (
  configuration: BaseGraphConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.aggregateFieldMetadataId)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Aggregate field metadata ID is required for graph widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Aggregate field is required for graph widget`,
    });
  }

  if (!isDefined(configuration.aggregateOperation)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Aggregate operation is required for graph widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Aggregate operation is required for graph widget`,
    });
  }

  return errors;
};
