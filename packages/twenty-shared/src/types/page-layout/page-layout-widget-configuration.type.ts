import { type AggregateOperations } from '../AggregateOperations';
import { type ObjectRecordGroupByDateGranularity } from '../ObjectRecordGroupByDateGranularity';
import { type SerializedRelation } from '../SerializedRelation.type';

import { type ChartFilter } from './chart-filter.type';
import { type RatioAggregateConfig } from './ratio-aggregate-config.type';

type BaseChartConfiguration = {
  aggregateFieldMetadataId: SerializedRelation;
  aggregateOperation: AggregateOperations;
  displayDataLabel?: boolean;
  description?: string;
  color?: string;
  filter?: ChartFilter;
  timezone?: string;
  firstDayOfTheWeek?: number;
};

export type AggregateChartConfiguration = BaseChartConfiguration & {
  configurationType: 'AGGREGATE_CHART';
  label?: string;
  format?: string;
  prefix?: string;
  suffix?: string;
  ratioAggregateConfig?: RatioAggregateConfig;
};

export type GaugeChartConfiguration = BaseChartConfiguration & {
  configurationType: 'GAUGE_CHART';
};

export type PieChartConfiguration = BaseChartConfiguration & {
  configurationType: 'PIE_CHART';
  groupByFieldMetadataId: SerializedRelation;
  groupBySubFieldName?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  orderBy?: string;
  manualSortOrder?: string[];
  showCenterMetric?: boolean;
  displayLegend?: boolean;
  hideEmptyCategory?: boolean;
  splitMultiValueFields?: boolean;
};

export type BarChartConfiguration = BaseChartConfiguration & {
  configurationType: 'BAR_CHART';
  primaryAxisGroupByFieldMetadataId: SerializedRelation;
  primaryAxisGroupBySubFieldName?: string;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisOrderBy?: string;
  primaryAxisManualSortOrder?: string[];
  secondaryAxisGroupByFieldMetadataId?: SerializedRelation;
  secondaryAxisGroupBySubFieldName?: string;
  secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity;
  secondaryAxisOrderBy?: string;
  secondaryAxisManualSortOrder?: string[];
  omitNullValues?: boolean;
  splitMultiValueFields?: boolean;
  axisNameDisplay?: string;
  displayLegend?: boolean;
  rangeMin?: number;
  rangeMax?: number;
  groupMode?: string;
  layout?: string;
  isCumulative?: boolean;
};

export type LineChartConfiguration = BaseChartConfiguration & {
  configurationType: 'LINE_CHART';
  primaryAxisGroupByFieldMetadataId: SerializedRelation;
  primaryAxisGroupBySubFieldName?: string;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisOrderBy?: string;
  primaryAxisManualSortOrder?: string[];
  secondaryAxisGroupByFieldMetadataId?: SerializedRelation;
  secondaryAxisGroupBySubFieldName?: string;
  secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity;
  secondaryAxisOrderBy?: string;
  secondaryAxisManualSortOrder?: string[];
  omitNullValues?: boolean;
  splitMultiValueFields?: boolean;
  axisNameDisplay?: string;
  displayLegend?: boolean;
  rangeMin?: number;
  rangeMax?: number;
  isStacked?: boolean;
  isCumulative?: boolean;
};

export type ViewConfiguration = {
  configurationType: 'VIEW';
};

export type FieldConfiguration = {
  configurationType: 'FIELD';
};

type NewFieldDefaultConfiguration = {
  isVisible: boolean;
  viewFieldGroupId: string | null;
};

export type FieldsConfiguration = {
  configurationType: 'FIELDS';
  viewId?: string | null;
  newFieldDefaultConfiguration?: NewFieldDefaultConfiguration | null;
};

export type FieldRichTextConfiguration = {
  configurationType: 'FIELD_RICH_TEXT';
};

export type StandaloneRichTextConfiguration = {
  configurationType: 'STANDALONE_RICH_TEXT';
  body: {
    blocknote?: string | null;
    markdown: string | null;
  };
};

export type IframeConfiguration = {
  configurationType: 'IFRAME';
  url?: string;
};

export type FrontComponentConfiguration = {
  configurationType: 'FRONT_COMPONENT';
  frontComponentId: string;
};

export type TimelineConfiguration = {
  configurationType: 'TIMELINE';
};

export type TasksConfiguration = {
  configurationType: 'TASKS';
};

export type NotesConfiguration = {
  configurationType: 'NOTES';
};

export type FilesConfiguration = {
  configurationType: 'FILES';
};

export type EmailsConfiguration = {
  configurationType: 'EMAILS';
};

export type CalendarConfiguration = {
  configurationType: 'CALENDAR';
};

export type WorkflowConfiguration = {
  configurationType: 'WORKFLOW';
};

export type WorkflowVersionConfiguration = {
  configurationType: 'WORKFLOW_VERSION';
};

export type WorkflowRunConfiguration = {
  configurationType: 'WORKFLOW_RUN';
};

export type PageLayoutWidgetConfiguration =
  | AggregateChartConfiguration
  | GaugeChartConfiguration
  | PieChartConfiguration
  | BarChartConfiguration
  | LineChartConfiguration
  | ViewConfiguration
  | FieldConfiguration
  | FieldsConfiguration
  | FieldRichTextConfiguration
  | StandaloneRichTextConfiguration
  | IframeConfiguration
  | FrontComponentConfiguration
  | TimelineConfiguration
  | TasksConfiguration
  | NotesConfiguration
  | FilesConfiguration
  | EmailsConfiguration
  | CalendarConfiguration
  | WorkflowConfiguration
  | WorkflowVersionConfiguration
  | WorkflowRunConfiguration;
