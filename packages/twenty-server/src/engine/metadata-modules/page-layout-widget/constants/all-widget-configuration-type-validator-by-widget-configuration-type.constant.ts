import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
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
    CALENDAR: class {
      configurationType: WidgetConfigurationType.CALENDAR;
    },
    EMAILS: class {
      configurationType: WidgetConfigurationType.EMAILS;
    },
    FIELD: class {
      configurationType: WidgetConfigurationType.FIELD;
    },
    FIELD_RICH_TEXT: class {
      configurationType: WidgetConfigurationType.FIELD_RICH_TEXT;
    },
    FIELDS: class {
      configurationType: WidgetConfigurationType.FIELDS;
    },
    FILES: class {
      configurationType: WidgetConfigurationType.FILES;
    },
    NOTES: class {
      configurationType: WidgetConfigurationType.NOTES;
    },
    TASKS: class {
      configurationType: WidgetConfigurationType.TASKS;
    },
    TIMELINE: class {
      configurationType: WidgetConfigurationType.TIMELINE;
    },
    VIEW: class {
      configurationType: WidgetConfigurationType.VIEW;
    },
    WORKFLOW: class {
      configurationType: WidgetConfigurationType.WORKFLOW;
    },
    WORKFLOW_RUN: class {
      configurationType: WidgetConfigurationType.WORKFLOW_RUN;
    },
    WORKFLOW_VERSION: class {
      configurationType: WidgetConfigurationType.WORKFLOW_VERSION;
    },
  } as const satisfies {
    [P in WidgetConfigurationType]: new () => PageLayoutWidgetConfigurationBase;
  };
