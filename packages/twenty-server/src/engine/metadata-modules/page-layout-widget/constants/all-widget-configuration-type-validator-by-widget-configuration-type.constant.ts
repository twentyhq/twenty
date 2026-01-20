import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { CalendarConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/calendar-configuration.dto';
import { EmailsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/emails-configuration.dto';
import { FieldConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/field-configuration.dto';
import { FieldRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/field-rich-text-configuration.dto';
import { FieldsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/fields-configuration.dto';
import { FilesConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/files-configuration.dto';
import { FrontComponentConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { NotesConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/notes-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { TasksConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/tasks-configuration.dto';
import { TimelineConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/timeline-configuration.dto';
import { ViewConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/view-configuration.dto';
import { WorkflowConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/workflow-configuration.dto';
import { WorkflowRunConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/workflow-run-configuration.dto';
import { WorkflowVersionConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/workflow-version-configuration.dto';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

export const ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE =
  {
    AGGREGATE_CHART: AggregateChartConfigurationDTO,
    STANDALONE_RICH_TEXT: StandaloneRichTextConfigurationDTO,
    PIE_CHART: PieChartConfigurationDTO,
    LINE_CHART: LineChartConfigurationDTO,
    IFRAME: IframeConfigurationDTO,
    GAUGE_CHART: GaugeChartConfigurationDTO,
    BAR_CHART: BarChartConfigurationDTO,
    CALENDAR: CalendarConfigurationDTO,
    FRONT_COMPONENT: FrontComponentConfigurationDTO,
    EMAILS: EmailsConfigurationDTO,
    FIELD: FieldConfigurationDTO,
    FIELD_RICH_TEXT: FieldRichTextConfigurationDTO,
    FIELDS: FieldsConfigurationDTO,
    FILES: FilesConfigurationDTO,
    NOTES: NotesConfigurationDTO,
    TASKS: TasksConfigurationDTO,
    TIMELINE: TimelineConfigurationDTO,
    VIEW: ViewConfigurationDTO,
    WORKFLOW: WorkflowConfigurationDTO,
    WORKFLOW_RUN: WorkflowRunConfigurationDTO,
    WORKFLOW_VERSION: WorkflowVersionConfigurationDTO,
  } as const satisfies {
    [P in WidgetConfigurationType]: new () => PageLayoutWidgetConfigurationBase;
  };
