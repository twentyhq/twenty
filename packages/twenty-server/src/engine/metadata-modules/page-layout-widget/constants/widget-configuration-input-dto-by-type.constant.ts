import { type ClassConstructor } from 'class-transformer/types/interfaces';

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

export const WIDGET_CONFIGURATION_INPUT_DTO_BY_TYPE: Partial<
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
