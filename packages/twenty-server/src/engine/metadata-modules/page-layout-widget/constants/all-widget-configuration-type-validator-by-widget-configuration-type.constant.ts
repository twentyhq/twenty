import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { AggregateChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/aggregate-chart-configuration.validation-schema';
import { BarChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/bar-chart-configuration.validation-schema';
import { CalendarConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/calendar-configuration.validation-schema';
import { EmailsConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/emails-configuration.validation-schema';
import { FieldConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/field-configuration.validation-schema';
import { FieldRichTextConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/field-rich-text-configuration.validation-schema';
import { FieldsConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/fields-configuration.validation-schema';
import { FilesConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/files-configuration.validation-schema';
import { GaugeChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/gauge-chart-configuration.validation-schema';
import { IframeConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/iframe-configuration.validation-schema';
import { LineChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/line-chart-configuration.validation-schema';
import { NotesConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/notes-configuration.validation-schema';
import { PieChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/pie-chart-configuration.validation-schema';
import { StandaloneRichTextConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/standalone-rich-text-configuration.validation-schema';
import { TasksConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/tasks-configuration.validation-schema';
import { TimelineConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/timeline-configuration.validation-schema';
import { ViewConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/view-configuration.validation-schema';
import { WorkflowConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/workflow-configuration.validation-schema';
import { WorkflowRunConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/workflow-run-configuration.validation-schema';
import { WorkflowVersionConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/workflow-version-configuration.validation-schema';
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
