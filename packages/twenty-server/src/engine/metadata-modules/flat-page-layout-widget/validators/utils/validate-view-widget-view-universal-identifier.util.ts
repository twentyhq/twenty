import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { validate as uuidValidate } from 'uuid';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateViewWidgetViewUniversalIdentifier = ({
  universalConfiguration,
  title: widgetTitle,
}: Pick<
  UniversalFlatPageLayoutWidget,
  'universalConfiguration' | 'title'
>): FlatPageLayoutWidgetValidationError[] => {
  if (
    universalConfiguration?.configurationType !== WidgetConfigurationType.VIEW
  ) {
    return [];
  }

  const { viewUniversalIdentifier } = universalConfiguration;

  if (
    isNonEmptyString(viewUniversalIdentifier) &&
    uuidValidate(viewUniversalIdentifier)
  ) {
    return [];
  }

  return [
    {
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`View widget "${widgetTitle}" must reference an existing view`,
      userFriendlyMessage: msg`View widget must reference an existing view`,
      value: viewUniversalIdentifier,
    },
  ];
};
