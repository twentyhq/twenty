import { isNumber } from '@sniptt/guards';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { z } from 'zod';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

// Chart color options (MAIN_COLOR_NAMES plus 'auto').
// should we export MAIN_COLOR_NAMES from twenty-ui to twenty-shared and use that here?
const CHART_COLORS = [
  'auto',
  'red',
  'ruby',
  'crimson',
  'tomato',
  'orange',
  'amber',
  'yellow',
  'lime',
  'grass',
  'green',
  'jade',
  'mint',
  'turquoise',
  'cyan',
  'sky',
  'blue',
  'iris',
  'violet',
  'purple',
  'plum',
  'pink',
  'bronze',
  'gold',
  'brown',
  'gray',
] as const;

const DATE_GRANULARITY_OPTIONS = [
  ObjectRecordGroupByDateGranularity.DAY,
  ObjectRecordGroupByDateGranularity.WEEK,
  ObjectRecordGroupByDateGranularity.MONTH,
  ObjectRecordGroupByDateGranularity.QUARTER,
  ObjectRecordGroupByDateGranularity.YEAR,
  ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK,
  ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR,
  ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR,
] as const;

const GRAPH_ORDER_BY_OPTIONS = Object.values(GraphOrderBy) as [
  GraphOrderBy,
  ...GraphOrderBy[],
];

const AXIS_NAME_DISPLAY_OPTIONS = Object.values(AxisNameDisplay) as [
  AxisNameDisplay,
  ...AxisNameDisplay[],
];

const BAR_CHART_GROUP_MODE_OPTIONS = Object.values(BarChartGroupMode) as [
  BarChartGroupMode,
  ...BarChartGroupMode[],
];

const BAR_CHART_LAYOUT_OPTIONS = Object.values(BarChartLayout) as [
  BarChartLayout,
  ...BarChartLayout[],
];

const AGGREGATE_OPERATION_OPTIONS = Object.values(AggregateOperations) as [
  AggregateOperations,
  ...AggregateOperations[],
];

const displayDataLabelSchema = z.boolean().optional();
const displayLegendSchema = z.boolean().optional();
const showCenterMetricSchema = z
  .boolean()
  .optional()
  .describe('Show aggregate value in center');
const hideEmptyCategorySchema = z
  .boolean()
  .optional()
  .describe('Hide slices with zero values');

type PrimarySecondaryManualSortFields = {
  primaryAxisOrderBy?: GraphOrderBy;
  primaryAxisManualSortOrder?: string[];
  secondaryAxisOrderBy?: GraphOrderBy;
  secondaryAxisManualSortOrder?: string[];
};

type ManualSortFields = {
  orderBy?: GraphOrderBy;
  manualSortOrder?: string[];
};

type RangeMinMaxFields = {
  rangeMin?: number;
  rangeMax?: number;
};

const ratioAggregateConfigSchema = z.object({
  fieldMetadataId: z.uuid(),
  optionValue: z.string(),
});

const withPrimarySecondaryManualSortRefinements = <
  T extends z.ZodType<PrimarySecondaryManualSortFields>,
>(
  schema: T,
) =>
  schema
    .refine(
      (data) =>
        data.primaryAxisOrderBy !== GraphOrderBy.MANUAL ||
        (Array.isArray(data.primaryAxisManualSortOrder) &&
          data.primaryAxisManualSortOrder.length > 0),
      {
        message:
          'primaryAxisManualSortOrder must be a non-empty array when primaryAxisOrderBy is MANUAL',
        path: ['primaryAxisManualSortOrder'],
      },
    )
    .refine(
      (data) =>
        data.secondaryAxisOrderBy !== GraphOrderBy.MANUAL ||
        (Array.isArray(data.secondaryAxisManualSortOrder) &&
          data.secondaryAxisManualSortOrder.length > 0),
      {
        message:
          'secondaryAxisManualSortOrder must be a non-empty array when secondaryAxisOrderBy is MANUAL',
        path: ['secondaryAxisManualSortOrder'],
      },
    );

const withManualSortRefinement = <T extends z.ZodType<ManualSortFields>>(
  schema: T,
) =>
  schema.refine(
    (data) =>
      data.orderBy !== GraphOrderBy.MANUAL ||
      (Array.isArray(data.manualSortOrder) && data.manualSortOrder.length > 0),
    {
      message:
        'manualSortOrder must be a non-empty array when orderBy is MANUAL',
      path: ['manualSortOrder'],
    },
  );

const withRangeMinMaxRefinement = <T extends z.ZodType<RangeMinMaxFields>>(
  schema: T,
) =>
  schema.refine(
    (data) =>
      !(
        isNumber(data.rangeMin) &&
        isNumber(data.rangeMax) &&
        data.rangeMin > data.rangeMax
      ),
    {
      message: 'rangeMin must be less than or equal to rangeMax',
      path: ['rangeMin'],
    },
  );

export const gridPositionSchema = z.object({
  row: z.number().min(0).describe('Row position (0-based)'),
  column: z
    .number()
    .min(0)
    .max(11)
    .describe('Column position (0-11 for 12-column grid)'),
  rowSpan: z.number().min(1).describe('Number of rows the widget spans'),
  columnSpan: z
    .number()
    .min(1)
    .max(12)
    .describe('Number of columns the widget spans (1-12)'),
});

export const widgetTypeSchema = z.enum([
  WidgetType.VIEW,
  WidgetType.GRAPH,
  WidgetType.IFRAME,
  WidgetType.STANDALONE_RICH_TEXT,
]);

// Graph configuration schema for AGGREGATE type (KPI numbers)
const aggregateChartConfigSchemaBase = z.object({
  configurationType: z.literal(WidgetConfigurationType.AGGREGATE_CHART),
  aggregateFieldMetadataId: z
    .uuid()
    .describe(
      'Field UUID to aggregate (must be from the widget objectMetadataId)',
    ),
  aggregateOperation: z
    .enum(AGGREGATE_OPERATION_OPTIONS)
    .describe('Aggregation operation: COUNT, SUM, AVG, MIN, MAX, etc.'),
  label: z.string().optional(),
  displayDataLabel: displayDataLabelSchema,
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  ratioAggregateConfig: ratioAggregateConfigSchema.optional(),
});

const aggregateChartConfigSchema = aggregateChartConfigSchemaBase.extend({
  displayDataLabel: displayDataLabelSchema.default(true),
});

const aggregateChartConfigSchemaWithoutDefaults =
  aggregateChartConfigSchemaBase;

// Graph configuration schema for BAR charts
const barChartConfigSchemaCore = z.object({
  configurationType: z.literal(WidgetConfigurationType.BAR_CHART),
  aggregateFieldMetadataId: z.uuid().describe('Field UUID to aggregate'),
  aggregateOperation: z.enum(AGGREGATE_OPERATION_OPTIONS),
  primaryAxisGroupByFieldMetadataId: z
    .uuid()
    .describe('Field UUID to group by on primary axis'),
  primaryAxisGroupBySubFieldName: z
    .string()
    .optional()
    .describe(
      'REQUIRED for relation fields (e.g. "name", "address.addressCity") and composite fields (e.g. "addressCity"). Without this, relation fields group by raw UUID which is not useful.',
    ),
  secondaryAxisGroupByFieldMetadataId: z.uuid().optional(),
  secondaryAxisGroupBySubFieldName: z
    .string()
    .optional()
    .describe(
      'REQUIRED for relation fields (e.g. "name", "stage") and composite fields (e.g. "addressCity"). Without this, relation fields group by raw UUID which is not useful.',
    ),
  primaryAxisOrderBy: z.enum(GRAPH_ORDER_BY_OPTIONS).optional(),
  primaryAxisManualSortOrder: z.array(z.string()).optional(),
  secondaryAxisOrderBy: z.enum(GRAPH_ORDER_BY_OPTIONS).optional(),
  secondaryAxisManualSortOrder: z.array(z.string()).optional(),
  omitNullValues: z.boolean().optional(),
  primaryAxisDateGranularity: z
    .enum(DATE_GRANULARITY_OPTIONS)
    .optional()
    .describe('Date grouping granularity for X axis'),
  secondaryAxisGroupByDateGranularity: z
    .enum(DATE_GRANULARITY_OPTIONS)
    .optional()
    .describe('Date grouping granularity for secondary grouping'),
  color: z.enum(CHART_COLORS).optional().describe('Chart color theme'),
  axisNameDisplay: z
    .enum(AXIS_NAME_DISPLAY_OPTIONS)
    .optional()
    .describe('Which axis labels to show'),
  displayDataLabel: displayDataLabelSchema,
  displayLegend: displayLegendSchema,
  groupMode: z
    .enum(BAR_CHART_GROUP_MODE_OPTIONS)
    .optional()
    .describe('Bar display mode when using secondary grouping'),
  isCumulative: z.boolean().optional().describe('Show running totals'),
  rangeMin: z.number().optional().describe('Y axis minimum value'),
  rangeMax: z.number().optional().describe('Y axis maximum value'),
  layout: z
    .enum(BAR_CHART_LAYOUT_OPTIONS)
    .describe('Layout orientation for bar charts'),
});

const barChartConfigSchemaWithoutDefaults = withRangeMinMaxRefinement(
  withPrimarySecondaryManualSortRefinements(barChartConfigSchemaCore),
);

const barChartConfigSchema = withRangeMinMaxRefinement(
  withPrimarySecondaryManualSortRefinements(
    barChartConfigSchemaCore.extend({
      displayDataLabel: displayDataLabelSchema.default(false),
      displayLegend: displayLegendSchema.default(true),
    }),
  ),
);

// Graph configuration schema for LINE charts
const lineChartConfigSchemaCore = z.object({
  configurationType: z.literal(WidgetConfigurationType.LINE_CHART),
  aggregateFieldMetadataId: z.uuid(),
  aggregateOperation: z.enum(AGGREGATE_OPERATION_OPTIONS),
  primaryAxisGroupByFieldMetadataId: z.uuid(),
  primaryAxisGroupBySubFieldName: z
    .string()
    .optional()
    .describe(
      'REQUIRED for relation fields (e.g. "name", "address.addressCity") and composite fields (e.g. "addressCity"). Without this, relation fields group by raw UUID which is not useful.',
    ),
  secondaryAxisGroupByFieldMetadataId: z.uuid().optional(),
  secondaryAxisGroupBySubFieldName: z
    .string()
    .optional()
    .describe(
      'REQUIRED for relation fields (e.g. "name", "stage") and composite fields (e.g. "addressCity"). Without this, relation fields group by raw UUID which is not useful.',
    ),
  primaryAxisOrderBy: z.enum(GRAPH_ORDER_BY_OPTIONS).optional(),
  primaryAxisManualSortOrder: z.array(z.string()).optional(),
  secondaryAxisOrderBy: z.enum(GRAPH_ORDER_BY_OPTIONS).optional(),
  secondaryAxisManualSortOrder: z.array(z.string()).optional(),
  omitNullValues: z.boolean().optional(),
  primaryAxisDateGranularity: z
    .enum(DATE_GRANULARITY_OPTIONS)
    .optional()
    .describe('Date grouping granularity for X axis'),
  secondaryAxisGroupByDateGranularity: z
    .enum(DATE_GRANULARITY_OPTIONS)
    .optional()
    .describe('Date grouping granularity for secondary grouping'),
  color: z.enum(CHART_COLORS).optional().describe('Line color theme'),
  axisNameDisplay: z
    .enum(AXIS_NAME_DISPLAY_OPTIONS)
    .optional()
    .describe('Which axis labels to show'),
  displayDataLabel: displayDataLabelSchema,
  displayLegend: displayLegendSchema,
  isStacked: z.boolean().optional().describe('Stack multiple lines'),
  isCumulative: z.boolean().optional().describe('Show running totals'),
  rangeMin: z.number().optional().describe('Y axis minimum value'),
  rangeMax: z.number().optional().describe('Y axis maximum value'),
});

const lineChartConfigSchemaWithoutDefaults = withRangeMinMaxRefinement(
  withPrimarySecondaryManualSortRefinements(lineChartConfigSchemaCore),
);

const lineChartConfigSchema = withRangeMinMaxRefinement(
  withPrimarySecondaryManualSortRefinements(
    lineChartConfigSchemaCore.extend({
      displayDataLabel: displayDataLabelSchema.default(false),
      displayLegend: displayLegendSchema.default(true),
    }),
  ),
);

// Graph configuration schema for PIE charts
const pieChartConfigSchemaCore = z.object({
  configurationType: z.literal(WidgetConfigurationType.PIE_CHART),
  aggregateFieldMetadataId: z.uuid(),
  aggregateOperation: z.enum(AGGREGATE_OPERATION_OPTIONS),
  groupByFieldMetadataId: z.uuid().describe('Field UUID to slice by'),
  groupBySubFieldName: z
    .string()
    .optional()
    .describe(
      'REQUIRED for relation fields (e.g. "name", "stage") and composite fields (e.g. "addressCity"). Without this, relation fields group by raw UUID which is not useful.',
    ),
  orderBy: z.enum(GRAPH_ORDER_BY_OPTIONS).optional(),
  manualSortOrder: z.array(z.string()).optional(),
  dateGranularity: z
    .enum(DATE_GRANULARITY_OPTIONS)
    .optional()
    .describe('Date grouping granularity when slicing by date'),
  color: z.enum(CHART_COLORS).optional().describe('Chart color theme'),
  displayDataLabel: displayDataLabelSchema,
  displayLegend: displayLegendSchema,
  showCenterMetric: showCenterMetricSchema,
  hideEmptyCategory: hideEmptyCategorySchema,
});

const pieChartConfigSchemaWithoutDefaults = withManualSortRefinement(
  pieChartConfigSchemaCore,
);

const pieChartConfigSchema = withManualSortRefinement(
  pieChartConfigSchemaCore.extend({
    displayDataLabel: displayDataLabelSchema.default(true),
    displayLegend: displayLegendSchema.default(true),
    showCenterMetric: showCenterMetricSchema.default(true),
    hideEmptyCategory: hideEmptyCategorySchema.default(false),
  }),
);

// Iframe configuration
const iframeConfigSchema = z.object({
  configurationType: z.literal(WidgetConfigurationType.IFRAME),
  url: z.string().url().optional().describe('URL to embed'),
});

// Rich text configuration
const richTextConfigSchema = z.object({
  configurationType: z.literal(WidgetConfigurationType.STANDALONE_RICH_TEXT),
  body: z
    .object({
      blocknote: z
        .string()
        .nullable()
        .optional()
        .describe(
          'BlockNote JSON string (advanced). Stringified array of BlockNote blocks.',
        ),
      markdown: z
        .string()
        .nullable()
        .optional()
        .describe(
          'Markdown content string (preferred for AI). Supports headings, bold, lists, links, etc.',
        ),
    })
    .describe(
      'Rich text content. Use { "markdown": "your content here" } for text. Supports full markdown syntax.',
    ),
});

export const graphConfigurationSchema = z.discriminatedUnion(
  'configurationType',
  [
    aggregateChartConfigSchema,
    barChartConfigSchema,
    lineChartConfigSchema,
    pieChartConfigSchema,
  ],
);

export const graphConfigurationSchemaWithoutDefaults = z.discriminatedUnion(
  'configurationType',
  [
    aggregateChartConfigSchemaWithoutDefaults,
    barChartConfigSchemaWithoutDefaults,
    lineChartConfigSchemaWithoutDefaults,
    pieChartConfigSchemaWithoutDefaults,
  ],
);

export const widgetConfigurationSchema = z
  .discriminatedUnion('configurationType', [
    aggregateChartConfigSchema,
    barChartConfigSchema,
    lineChartConfigSchema,
    pieChartConfigSchema,
    iframeConfigSchema,
    richTextConfigSchema,
  ])
  .optional()
  .describe('Widget configuration - structure depends on widget type');

export const widgetConfigurationSchemaWithoutDefaults = z
  .discriminatedUnion('configurationType', [
    aggregateChartConfigSchemaWithoutDefaults,
    barChartConfigSchemaWithoutDefaults,
    lineChartConfigSchemaWithoutDefaults,
    pieChartConfigSchemaWithoutDefaults,
    iframeConfigSchema,
    richTextConfigSchema,
  ])
  .optional()
  .describe('Widget configuration - structure depends on widget type');

// Export enums for documentation
export { AggregateOperations, WidgetConfigurationType };
