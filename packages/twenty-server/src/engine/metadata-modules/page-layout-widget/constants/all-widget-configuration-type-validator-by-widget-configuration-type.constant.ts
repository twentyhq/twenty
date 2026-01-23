import { AggregateChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.validation-schema';
import { BarChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.validation-schema';
import { CalendarConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/calendar-configuration.validation-schema';
import { EmailsConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/emails-configuration.validation-schema';
import { FieldConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/field-configuration.validation-schema';
import { FieldRichTextConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/field-rich-text-configuration.validation-schema';
import { FieldsConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/fields-configuration.validation-schema';
import { FilesConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/files-configuration.validation-schema';
import { GaugeChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.validation-schema';
import { IframeConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.validation-schema';
import { LineChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.validation-schema';
import { NotesConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/notes-configuration.validation-schema';
import { PieChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.validation-schema';
import { StandaloneRichTextConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.validation-schema';
import { TasksConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/tasks-configuration.validation-schema';
import { TimelineConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/timeline-configuration.validation-schema';
import { ViewConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/view-configuration.validation-schema';
import { WorkflowConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/workflow-configuration.validation-schema';
import { WorkflowRunConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/workflow-run-configuration.validation-schema';
import { WorkflowVersionConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/workflow-version-configuration.validation-schema';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

export const ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE =
  {
    AGGREGATE_CHART: AggregateChartConfigurationValidationSchema,
    STANDALONE_RICH_TEXT: StandaloneRichTextConfigurationValidationSchema,
    PIE_CHART: PieChartConfigurationValidationSchema,
    LINE_CHART: LineChartConfigurationValidationSchema,
    IFRAME: IframeConfigurationValidationSchema,
    GAUGE_CHART: GaugeChartConfigurationValidationSchema,
    BAR_CHART: BarChartConfigurationValidationSchema,
    CALENDAR: CalendarConfigurationValidationSchema,
    EMAILS: EmailsConfigurationValidationSchema,
    FIELD: FieldConfigurationValidationSchema,
    FIELD_RICH_TEXT: FieldRichTextConfigurationValidationSchema,
    FIELDS: FieldsConfigurationValidationSchema,
    FILES: FilesConfigurationValidationSchema,
    NOTES: NotesConfigurationValidationSchema,
    TASKS: TasksConfigurationValidationSchema,
    TIMELINE: TimelineConfigurationValidationSchema,
    VIEW: ViewConfigurationValidationSchema,
    WORKFLOW: WorkflowConfigurationValidationSchema,
    WORKFLOW_RUN: WorkflowRunConfigurationValidationSchema,
    WORKFLOW_VERSION: WorkflowVersionConfigurationValidationSchema,
  } as const satisfies {
    [P in WidgetConfigurationType]: new () => PageLayoutWidgetConfigurationBase;
  };
