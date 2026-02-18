import { type AggregateOperations } from '../AggregateOperations';

type ChartFilterRecordFilter = {
  id: string;
  fieldMetadataUniversalIdentifier: string;
  operand: string;
  value?: string | null;
  type?: string;
  recordFilterGroupId?: string | null;
  subFieldName?: string | null;
};

type ChartFilterRecordFilterGroup = {
  id: string;
  logicalOperator: string;
  parentRecordFilterGroupId?: string | null;
};

type UniversalChartFilter = {
  recordFilters?: ChartFilterRecordFilter[];
  recordFilterGroups?: ChartFilterRecordFilterGroup[];
};

type RatioAggregateConfig = {
  fieldMetadataUniversalIdentifier: string | null;
  optionValue: string;
};

type BaseChartFields = {
  aggregateFieldMetadataUniversalIdentifier: string | null;
  aggregateOperation: AggregateOperations;
  displayDataLabel?: boolean;
  description?: string;
  color?: string;
  filter?: UniversalChartFilter;
  timezone?: string;
  firstDayOfTheWeek?: number;
};

type AggregateChartUniversalConfiguration = BaseChartFields & {
  configurationType: 'AGGREGATE_CHART';
  label?: string;
  format?: string;
  prefix?: string;
  suffix?: string;
  ratioAggregateConfig?: RatioAggregateConfig;
};

type GaugeChartUniversalConfiguration = BaseChartFields & {
  configurationType: 'GAUGE_CHART';
};

type PieChartUniversalConfiguration = BaseChartFields & {
  configurationType: 'PIE_CHART';
  groupByFieldMetadataUniversalIdentifier: string | null;
  groupBySubFieldName?: string;
  dateGranularity?: string;
  orderBy?: string;
  manualSortOrder?: string[];
  showCenterMetric?: boolean;
  displayLegend?: boolean;
  hideEmptyCategory?: boolean;
  splitMultiValueFields?: boolean;
};

type BarChartUniversalConfiguration = BaseChartFields & {
  configurationType: 'BAR_CHART';
  primaryAxisGroupByFieldMetadataUniversalIdentifier: string | null;
  primaryAxisGroupBySubFieldName?: string;
  primaryAxisDateGranularity?: string;
  primaryAxisOrderBy?: string;
  primaryAxisManualSortOrder?: string[];
  secondaryAxisGroupByFieldMetadataUniversalIdentifier?: string | null;
  secondaryAxisGroupBySubFieldName?: string;
  secondaryAxisGroupByDateGranularity?: string;
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

type LineChartUniversalConfiguration = BaseChartFields & {
  configurationType: 'LINE_CHART';
  primaryAxisGroupByFieldMetadataUniversalIdentifier: string | null;
  primaryAxisGroupBySubFieldName?: string;
  primaryAxisDateGranularity?: string;
  primaryAxisOrderBy?: string;
  primaryAxisManualSortOrder?: string[];
  secondaryAxisGroupByFieldMetadataUniversalIdentifier?: string | null;
  secondaryAxisGroupBySubFieldName?: string;
  secondaryAxisGroupByDateGranularity?: string;
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

type ViewUniversalConfiguration = {
  configurationType: 'VIEW';
};

type FieldUniversalConfiguration = {
  configurationType: 'FIELD';
};

type FieldsUniversalConfiguration = {
  configurationType: 'FIELDS';
  viewId?: string | null;
  newFieldDefaultConfiguration?: {
    isVisible: boolean;
    viewFieldGroupId: string | null;
  } | null;
};

type FieldRichTextUniversalConfiguration = {
  configurationType: 'FIELD_RICH_TEXT';
};

type StandaloneRichTextUniversalConfiguration = {
  configurationType: 'STANDALONE_RICH_TEXT';
  body: {
    blocknote?: string | null;
    markdown: string | null;
  };
};

type IframeUniversalConfiguration = {
  configurationType: 'IFRAME';
  url?: string;
};

type FrontComponentUniversalConfiguration = {
  configurationType: 'FRONT_COMPONENT';
  frontComponentId: string;
};

type TimelineUniversalConfiguration = {
  configurationType: 'TIMELINE';
};

type TasksUniversalConfiguration = {
  configurationType: 'TASKS';
};

type NotesUniversalConfiguration = {
  configurationType: 'NOTES';
};

type FilesUniversalConfiguration = {
  configurationType: 'FILES';
};

type EmailsUniversalConfiguration = {
  configurationType: 'EMAILS';
};

type CalendarUniversalConfiguration = {
  configurationType: 'CALENDAR';
};

type WorkflowUniversalConfiguration = {
  configurationType: 'WORKFLOW';
};

type WorkflowVersionUniversalConfiguration = {
  configurationType: 'WORKFLOW_VERSION';
};

type WorkflowRunUniversalConfiguration = {
  configurationType: 'WORKFLOW_RUN';
};

export type PageLayoutWidgetUniversalConfiguration =
  | AggregateChartUniversalConfiguration
  | GaugeChartUniversalConfiguration
  | PieChartUniversalConfiguration
  | BarChartUniversalConfiguration
  | LineChartUniversalConfiguration
  | ViewUniversalConfiguration
  | FieldUniversalConfiguration
  | FieldsUniversalConfiguration
  | FieldRichTextUniversalConfiguration
  | StandaloneRichTextUniversalConfiguration
  | IframeUniversalConfiguration
  | FrontComponentUniversalConfiguration
  | TimelineUniversalConfiguration
  | TasksUniversalConfiguration
  | NotesUniversalConfiguration
  | FilesUniversalConfiguration
  | EmailsUniversalConfiguration
  | CalendarUniversalConfiguration
  | WorkflowUniversalConfiguration
  | WorkflowVersionUniversalConfiguration
  | WorkflowRunUniversalConfiguration;
