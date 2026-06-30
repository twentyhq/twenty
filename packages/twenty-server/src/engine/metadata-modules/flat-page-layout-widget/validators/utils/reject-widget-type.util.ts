import { type msg } from '@lingui/core/macro';

import { type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';

export const rejectWidgetType = (
  widgetType: WidgetType,
  message: string,
  userFriendlyMessage: ReturnType<typeof msg>,
) => {
  return (
    args: GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs,
  ): FlatPageLayoutWidgetValidationError[] => {
    if (isCallerTwentyStandardApp(args.buildOptions)) {
      return [];
    }

    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message,
        value: widgetType,
        userFriendlyMessage,
      },
    ];
  };
};
