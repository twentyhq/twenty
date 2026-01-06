import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

type RichTextV2Body = {
  blocknote?: string | null;
  markdown?: string | null;
};

type StandaloneRichTextConfiguration = {
  configurationType?: WidgetConfigurationType;
  body?: RichTextV2Body;
};

const validateConfigurationType = (
  configuration: StandaloneRichTextConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.configurationType)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration type is required for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration type is required`,
    });

    return errors;
  }

  if (
    configuration.configurationType !==
    WidgetConfigurationType.STANDALONE_RICH_TEXT
  ) {
    const expectedConfigurationType =
      WidgetConfigurationType.STANDALONE_RICH_TEXT;

    const configurationType = configuration.configurationType;

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for standalone rich text widget "${widgetTitle}". Expected ${expectedConfigurationType}, got ${configurationType}`,
      userFriendlyMessage: msg`Invalid configuration type for standalone rich text widget`,
      value: configuration.configurationType,
    });
  }

  return errors;
};

const validateBody = (
  configuration: StandaloneRichTextConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.body)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Body is required for standalone rich text widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Body is required for standalone rich text widget`,
    });

    return errors;
  }

  if (typeof configuration.body !== 'object') {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Body must be an object for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Body must be an object`,
      value: configuration.body,
    });
  }

  return errors;
};

export const validateStandaloneRichTextFlatPageLayoutWidget = ({
  flatEntityToValidate,
}: GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs): FlatPageLayoutWidgetValidationError[] => {
  const { configuration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration is required for standalone rich text widget "${title}"`,
      userFriendlyMessage: msg`Configuration is required for standalone rich text widget`,
    });

    return errors;
  }

  const standaloneRichTextConfiguration =
    configuration as StandaloneRichTextConfiguration;

  const configurationTypeErrors = validateConfigurationType(
    standaloneRichTextConfiguration,
    title,
  );

  errors.push(...configurationTypeErrors);

  const bodyErrors = validateBody(standaloneRichTextConfiguration, title);

  errors.push(...bodyErrors);

  return errors;
};
