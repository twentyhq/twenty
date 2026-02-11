import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { VALID_GRAPH_CONFIGURATION_TYPES } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/constants/valid-graph-configuration-types.constant';
import { type AllGraphWidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateGraphConfigurationType = ({
  universalConfiguration,
  widgetTitle,
}: {
  universalConfiguration: UniversalFlatPageLayoutWidget['universalConfiguration'];
  widgetTitle: string;
}):
  | {
      status: 'fail';
      errors: FlatPageLayoutWidgetValidationError[];
    }
  | {
      status: 'success';
      graphUniversalConfiguration: UniversalFlatPageLayoutWidget<AllGraphWidgetConfigurationType>['universalConfiguration'];
    } => {
  if (!isDefined(universalConfiguration.configurationType)) {
    return {
      errors: [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Configuration type is required for widget "${widgetTitle}"`,
          userFriendlyMessage: msg`Configuration type is required`,
        },
      ],
      status: 'fail',
    };
  }

  const isValidGraphConfigurationType =
    VALID_GRAPH_CONFIGURATION_TYPES.includes(
      universalConfiguration.configurationType as (typeof VALID_GRAPH_CONFIGURATION_TYPES)[number],
    );

  if (!isValidGraphConfigurationType) {
    const expectedConfigurationTypes = VALID_GRAPH_CONFIGURATION_TYPES.map(
      (type) => type.toString(),
    ).join(', ');

    const configurationTypeString =
      universalConfiguration.configurationType.toString();

    return {
      errors: [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Invalid configuration type for graph widget "${widgetTitle}". Expected one of ${expectedConfigurationTypes}, got ${configurationTypeString}`,
          userFriendlyMessage: msg`Invalid configuration type for graph widget`,
          value: universalConfiguration.configurationType,
        },
      ],
      status: 'fail',
    };
  }

  return {
    status: 'success',
    graphUniversalConfiguration:
      universalConfiguration as UniversalFlatPageLayoutWidget<AllGraphWidgetConfigurationType>['universalConfiguration'],
  };
};
