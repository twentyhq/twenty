import { type msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const rejectWidgetType = (
  widgetType: WidgetType,
  message: string,
  userFriendlyMessage: ReturnType<typeof msg>,
) => {
  return (
    args: GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs,
  ): FlatPageLayoutWidgetValidationError[] => {
    const isCreation = !isDefined(args.updates);

    if (isCreation) {
      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message,
          value: widgetType,
          userFriendlyMessage,
        },
      ];
    }

    return [];
  };
};
