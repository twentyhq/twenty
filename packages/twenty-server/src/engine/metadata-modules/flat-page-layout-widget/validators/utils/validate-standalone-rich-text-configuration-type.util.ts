import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

export const validateStandaloneRichTextConfigurationType = ({
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
      standaloneRichTextUniversalConfiguration: UniversalFlatPageLayoutWidget<WidgetConfigurationType.STANDALONE_RICH_TEXT>['universalConfiguration'];
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

  if (
    universalConfiguration.configurationType !==
    WidgetConfigurationType.STANDALONE_RICH_TEXT
  ) {
    const configurationTypeString =
      universalConfiguration.configurationType.toString();

    return {
      errors: [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: t`Invalid configuration type for standalone rich text widget "${widgetTitle}". Expected STANDALONE_RICH_TEXT, got ${configurationTypeString}`,
          userFriendlyMessage: msg`Invalid configuration type for standalone rich text widget`,
          value: universalConfiguration.configurationType,
        },
      ],
      status: 'fail',
    };
  }

  return {
    status: 'success',
    standaloneRichTextUniversalConfiguration:
      universalConfiguration as UniversalFlatPageLayoutWidget<WidgetConfigurationType.STANDALONE_RICH_TEXT>['universalConfiguration'],
  };
};
