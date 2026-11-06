import { type ClassConstructor } from 'class-transformer/types/interfaces';
import { isNotEmptyObject, type ValidationError } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { CallRecordingSummaryConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/call-recording-summary-configuration.dto';
import { CallRecordingTranscriptConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/call-recording-transcript-configuration.dto';
import { ChatConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/chat-configuration.dto';
import { ChatThreadsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/chat-threads-configuration.dto';
import { EmailThreadConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/email-thread-configuration.dto';
import { FormFieldConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/form-field-configuration.dto';
import { FieldConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/field-configuration.dto';
import { FrontComponentConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { MessageCampaignBodyConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/message-campaign-body-configuration.dto';
import { MessageCampaignDetailsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/message-campaign-details-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { RecordTableConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/record-table-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetConfigurationByDto } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-by-dto.util';

const WIDGET_CONFIGURATION_DTO_BY_TYPE: Partial<
  Record<
    WidgetConfigurationType,
    ClassConstructor<AllPageLayoutWidgetConfiguration>
  >
> = {
  [WidgetConfigurationType.BAR_CHART]: BarChartConfigurationDTO,
  [WidgetConfigurationType.LINE_CHART]: LineChartConfigurationDTO,
  [WidgetConfigurationType.PIE_CHART]: PieChartConfigurationDTO,
  [WidgetConfigurationType.AGGREGATE_CHART]: AggregateChartConfigurationDTO,
  [WidgetConfigurationType.IFRAME]: IframeConfigurationDTO,
  [WidgetConfigurationType.STANDALONE_RICH_TEXT]:
    StandaloneRichTextConfigurationDTO,
  [WidgetConfigurationType.FRONT_COMPONENT]: FrontComponentConfigurationDTO,
  [WidgetConfigurationType.RECORD_TABLE]: RecordTableConfigurationDTO,
  [WidgetConfigurationType.EMAIL_THREAD]: EmailThreadConfigurationDTO,
  [WidgetConfigurationType.CALL_RECORDING_SUMMARY]:
    CallRecordingSummaryConfigurationDTO,
  [WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT]:
    CallRecordingTranscriptConfigurationDTO,
  [WidgetConfigurationType.CHAT_THREADS]: ChatThreadsConfigurationDTO,
  [WidgetConfigurationType.CHAT]: ChatConfigurationDTO,
  [WidgetConfigurationType.MESSAGE_CAMPAIGN_BODY]:
    MessageCampaignBodyConfigurationDTO,
  [WidgetConfigurationType.MESSAGE_CAMPAIGN_DETAILS]:
    MessageCampaignDetailsConfigurationDTO,
  [WidgetConfigurationType.FIELD]: FieldConfigurationDTO,
  [WidgetConfigurationType.FORM_FIELD]: FormFieldConfigurationDTO,
};

const UNSUPPORTED_WIDGET_CONFIGURATION_LABEL_BY_TYPE: Partial<
  Record<WidgetConfigurationType, string>
> = {
  [WidgetConfigurationType.VIEW]: 'View',
  [WidgetConfigurationType.FIELDS]: 'Fields',
  [WidgetConfigurationType.TIMELINE]: 'Timeline',
  [WidgetConfigurationType.TASKS]: 'Tasks',
  [WidgetConfigurationType.NOTES]: 'Notes',
  [WidgetConfigurationType.FILES]: 'Files',
  [WidgetConfigurationType.EMAILS]: 'Emails',
  [WidgetConfigurationType.CALENDAR]: 'Calendar',
  [WidgetConfigurationType.FIELD_RICH_TEXT]: 'Field rich text',
  [WidgetConfigurationType.WORKFLOW]: 'Workflow',
  [WidgetConfigurationType.WORKFLOW_VERSION]: 'Workflow version',
  [WidgetConfigurationType.WORKFLOW_RUN]: 'Workflow run',
};

const formatValidationErrors = (
  errors: ValidationError[],
  parentProperty?: string,
): string => {
  return errors
    .map((error) => {
      const propertyPath = parentProperty
        ? `${parentProperty}.${error.property}`
        : error.property;

      if (error.constraints) {
        const constraints = Object.values(error.constraints).join(', ');

        return `${propertyPath}: ${constraints}`;
      }

      if (error.children && error.children.length > 0) {
        return formatValidationErrors(error.children, propertyPath);
      }

      return `${propertyPath}: Unknown error`;
    })
    .join('; ');
};

// A layout saved in bulk carries drafts and widget types the widget API cannot create, so it is only cleaned, never refused
export const sanitizeWidgetConfigurationInputOrThrow = <TConfiguration>({
  configuration,
  shouldRefuseInvalidConfiguration = true,
}: {
  configuration: TConfiguration;
  shouldRefuseInvalidConfiguration?: boolean;
}): TConfiguration => {
  if (!isNotEmptyObject(configuration)) {
    if (!shouldRefuseInvalidConfiguration) {
      return configuration;
    }

    throw new PageLayoutWidgetException(
      'Invalid configuration: not an object',
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  const configurationRecord = configuration as Record<string, unknown>;

  if (
    !Object.prototype.hasOwnProperty.call(
      configurationRecord,
      'configurationType',
    )
  ) {
    if (!shouldRefuseInvalidConfiguration) {
      return configuration;
    }

    throw new PageLayoutWidgetException(
      'Invalid configuration: missing configuration type',
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  const configurationType =
    configurationRecord.configurationType as WidgetConfigurationType;

  const WidgetConfigurationDto =
    WIDGET_CONFIGURATION_DTO_BY_TYPE[configurationType];

  if (!isDefined(WidgetConfigurationDto)) {
    const unsupportedTypeLabel =
      UNSUPPORTED_WIDGET_CONFIGURATION_LABEL_BY_TYPE[configurationType];

    if (!shouldRefuseInvalidConfiguration) {
      return configuration;
    }

    throw new PageLayoutWidgetException(
      isDefined(unsupportedTypeLabel)
        ? `${unsupportedTypeLabel} configuration is not supported yet`
        : `Invalid configuration type: ${configurationType}`,
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  const result = validateWidgetConfigurationByDto({
    DtoClass: WidgetConfigurationDto,
    configuration: configurationRecord,
  });

  if (shouldRefuseInvalidConfiguration && result.errors.length > 0) {
    throw new PageLayoutWidgetException(
      formatValidationErrors(result.errors),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  return result.sanitizedConfiguration as TConfiguration;
};
