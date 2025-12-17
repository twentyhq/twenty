import { z } from 'zod';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { GraphType } from 'src/engine/metadata-modules/page-layout/enums/graph-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

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
const aggregateChartConfigSchema = z.object({
  graphType: z.literal(GraphType.AGGREGATE),
  aggregateFieldMetadataId: z
    .string()
    .uuid()
    .describe(
      'Field UUID to aggregate (must be from the widget objectMetadataId)',
    ),
  aggregateOperation: z
    .nativeEnum(AggregateOperations)
    .describe('Aggregation operation: COUNT, SUM, AVG, MIN, MAX, etc.'),
  displayDataLabel: z.boolean().optional().default(true),
  label: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  filter: z.record(z.string(), z.unknown()).optional(),
});

// Graph configuration schema for BAR charts
const barChartConfigSchema = z.object({
  graphType: z.enum([GraphType.VERTICAL_BAR, GraphType.HORIZONTAL_BAR]),
  aggregateFieldMetadataId: z
    .string()
    .uuid()
    .describe('Field UUID to aggregate'),
  aggregateOperation: z.nativeEnum(AggregateOperations),
  primaryAxisGroupByFieldMetadataId: z
    .string()
    .uuid()
    .describe('Field UUID to group by on primary axis'),
  secondaryAxisGroupByFieldMetadataId: z.string().uuid().optional(),
  primaryAxisOrderBy: z
    .enum(['FIELD_ASC', 'FIELD_DESC', 'VALUE_ASC', 'VALUE_DESC'])
    .optional(),
  displayDataLabel: z.boolean().optional().default(false),
  displayLegend: z.boolean().optional().default(true),
  filter: z.record(z.string(), z.unknown()).optional(),
});

// Graph configuration schema for LINE charts
const lineChartConfigSchema = z.object({
  graphType: z.literal(GraphType.LINE),
  aggregateFieldMetadataId: z.string().uuid(),
  aggregateOperation: z.nativeEnum(AggregateOperations),
  primaryAxisGroupByFieldMetadataId: z.string().uuid(),
  secondaryAxisGroupByFieldMetadataId: z.string().uuid().optional(),
  primaryAxisOrderBy: z
    .enum(['FIELD_ASC', 'FIELD_DESC', 'VALUE_ASC', 'VALUE_DESC'])
    .optional(),
  displayDataLabel: z.boolean().optional().default(false),
  filter: z.record(z.string(), z.unknown()).optional(),
});

// Graph configuration schema for PIE charts
const pieChartConfigSchema = z.object({
  graphType: z.literal(GraphType.PIE),
  aggregateFieldMetadataId: z.string().uuid(),
  aggregateOperation: z.nativeEnum(AggregateOperations),
  groupByFieldMetadataId: z.string().uuid().describe('Field UUID to slice by'),
  orderBy: z
    .enum(['FIELD_ASC', 'FIELD_DESC', 'VALUE_ASC', 'VALUE_DESC'])
    .optional(),
  displayDataLabel: z.boolean().optional().default(true),
  filter: z.record(z.string(), z.unknown()).optional(),
});

// Iframe configuration
const iframeConfigSchema = z.object({
  url: z.string().url().describe('URL to embed'),
});

// Rich text configuration
const richTextConfigSchema = z.object({
  body: z.string().optional().describe('Rich text content'),
});

export const graphConfigurationSchema = z.discriminatedUnion('graphType', [
  aggregateChartConfigSchema,
  barChartConfigSchema,
  lineChartConfigSchema,
  pieChartConfigSchema,
]);

export const widgetConfigurationSchema = z
  .union([graphConfigurationSchema, iframeConfigSchema, richTextConfigSchema])
  .optional()
  .describe('Widget configuration - structure depends on widget type');

// Export enums for documentation
export { AggregateOperations, GraphType };
