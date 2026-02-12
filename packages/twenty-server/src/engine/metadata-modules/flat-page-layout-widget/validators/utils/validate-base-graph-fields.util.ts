import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type AllGraphWidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateBaseGraphFields = ({
  graphUniversalConfiguration,
  widgetTitle,
}: {
  graphUniversalConfiguration: UniversalFlatPageLayoutWidget<AllGraphWidgetConfigurationType>['universalConfiguration'];
  widgetTitle: string;
}): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (
    !isDefined(
      graphUniversalConfiguration.aggregateFieldMetadataUniversalIdentifier,
    )
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Aggregate field metadata is required for graph widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Aggregate field is required for graph widget`,
    });
  }

  if (!isDefined(graphUniversalConfiguration.aggregateOperation)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Aggregate operation is required for graph widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Aggregate operation is required for graph widget`,
    });
  }

  return errors;
};
