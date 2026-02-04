import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { widgetConfigurationSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const buildDashboardWidgetConfigSchema = z
  .object({
    object: z
      .string()
      .min(1)
      .describe('Object name or label (singular/plural)'),
    configurationType: z
      .enum([
        WidgetConfigurationType.AGGREGATE_CHART,
        WidgetConfigurationType.BAR_CHART,
        WidgetConfigurationType.LINE_CHART,
        WidgetConfigurationType.PIE_CHART,
      ])
      .describe('Chart configuration type'),
    aggregateOperation: z
      .nativeEnum(AggregateOperations)
      .describe('Aggregation operation'),
    aggregateField: z
      .string()
      .min(1)
      .describe('Field name or label to aggregate'),
    groupByField: z
      .string()
      .min(1)
      .optional()
      .describe('Field name or label to group by'),
    secondaryGroupByField: z
      .string()
      .min(1)
      .optional()
      .describe('Secondary group by field (BAR only)'),
    layout: z
      .nativeEnum(BarChartLayout)
      .optional()
      .describe('BAR chart layout'),
  })
  .superRefine((values, ctx) => {
    const requiresGroupBy =
      values.configurationType !== WidgetConfigurationType.AGGREGATE_CHART;

    if (requiresGroupBy && !values.groupByField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['groupByField'],
        message: 'groupByField is required for BAR, LINE, and PIE charts',
      });
    }

    if (
      values.configurationType !== WidgetConfigurationType.BAR_CHART &&
      values.secondaryGroupByField
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['secondaryGroupByField'],
        message: 'secondaryGroupByField is only supported for BAR charts',
      });
    }

    if (
      values.configurationType !== WidgetConfigurationType.BAR_CHART &&
      values.layout
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['layout'],
        message: 'layout is only supported for BAR charts',
      });
    }
  });

type CandidateObject = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
};

type CandidateField = {
  id: string;
  name: string;
  label: string;
  objectMetadataId: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

const matchesValue = (value: string | null | undefined, query: string) =>
  isDefined(value) && normalize(value) === query;

const buildCandidateObject = (object: {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
}): CandidateObject => ({
  id: object.id,
  nameSingular: object.nameSingular,
  namePlural: object.namePlural,
  labelSingular: object.labelSingular,
  labelPlural: object.labelPlural,
});

const buildCandidateField = (field: {
  id: string;
  name: string;
  label: string;
  objectMetadataId: string;
}): CandidateField => ({
  id: field.id,
  name: field.name,
  label: field.label,
  objectMetadataId: field.objectMetadataId,
});

export const createBuildDashboardWidgetConfigTool = (
  deps: Pick<DashboardToolDependencies, 'flatEntityMapsCacheService'>,
  context: DashboardToolContext,
) => ({
  name: 'build_dashboard_widget_config' as const,
  description:
    'Resolve object/field IDs from names/labels and build a valid GRAPH widget configuration.',
  inputSchema: buildDashboardWidgetConfigSchema,
  execute: async (parameters: {
    object: string;
    configurationType:
      | WidgetConfigurationType.AGGREGATE_CHART
      | WidgetConfigurationType.BAR_CHART
      | WidgetConfigurationType.LINE_CHART
      | WidgetConfigurationType.PIE_CHART;
    aggregateOperation: AggregateOperations;
    aggregateField: string;
    groupByField?: string;
    secondaryGroupByField?: string;
    layout?: BarChartLayout;
  }) => {
    try {
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId: context.workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
          },
        );

      const objectQuery = normalize(parameters.object);
      const objectMatches = Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((object) => object.isActive)
        .filter(
          (object) =>
            matchesValue(object.nameSingular, objectQuery) ||
            matchesValue(object.namePlural, objectQuery) ||
            matchesValue(object.labelSingular, objectQuery) ||
            matchesValue(object.labelPlural, objectQuery),
        );

      if (objectMatches.length === 0) {
        return {
          success: false,
          message: `No object found matching "${parameters.object}"`,
        };
      }

      if (objectMatches.length > 1) {
        return {
          success: false,
          message: `Multiple objects match "${parameters.object}". Please clarify.`,
          candidates: {
            objects: objectMatches.map(buildCandidateObject),
          },
        };
      }

      const targetObject = objectMatches[0];

      const objectFields = Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((field) => field.objectMetadataId === targetObject.id)
        .filter((field) => field.isActive);

      const resolveField = (fieldQuery: string) => {
        const normalized = normalize(fieldQuery);

        return objectFields.filter(
          (field) =>
            matchesValue(field.name, normalized) ||
            matchesValue(field.label, normalized),
        );
      };

      const aggregateFieldMatches = resolveField(parameters.aggregateField);

      if (aggregateFieldMatches.length === 0) {
        return {
          success: false,
          message: `No field found matching "${parameters.aggregateField}" on ${targetObject.labelSingular}`,
        };
      }

      if (aggregateFieldMatches.length > 1) {
        return {
          success: false,
          message: `Multiple fields match "${parameters.aggregateField}". Please clarify.`,
          candidates: {
            fields: {
              aggregateField: aggregateFieldMatches.map(buildCandidateField),
            },
          },
        };
      }

      const aggregateField = aggregateFieldMatches[0];
      let groupByField: CandidateField | null = null;
      let secondaryGroupByField: CandidateField | null = null;

      if (
        parameters.configurationType !== WidgetConfigurationType.AGGREGATE_CHART
      ) {
        const groupByMatches = resolveField(parameters.groupByField ?? '');

        if (groupByMatches.length === 0) {
          return {
            success: false,
            message: `No field found matching "${parameters.groupByField}" on ${targetObject.labelSingular}`,
          };
        }

        if (groupByMatches.length > 1) {
          return {
            success: false,
            message: `Multiple fields match "${parameters.groupByField}". Please clarify.`,
            candidates: {
              fields: {
                groupByField: groupByMatches.map(buildCandidateField),
              },
            },
          };
        }

        groupByField = buildCandidateField(groupByMatches[0]);
      }

      if (
        parameters.configurationType === WidgetConfigurationType.BAR_CHART &&
        parameters.secondaryGroupByField
      ) {
        const secondaryMatches = resolveField(parameters.secondaryGroupByField);

        if (secondaryMatches.length === 0) {
          return {
            success: false,
            message: `No field found matching "${parameters.secondaryGroupByField}" on ${targetObject.labelSingular}`,
          };
        }

        if (secondaryMatches.length > 1) {
          return {
            success: false,
            message: `Multiple fields match "${parameters.secondaryGroupByField}". Please clarify.`,
            candidates: {
              fields: {
                secondaryGroupByField:
                  secondaryMatches.map(buildCandidateField),
              },
            },
          };
        }

        secondaryGroupByField = buildCandidateField(secondaryMatches[0]);
      }

      let configuration: Record<string, unknown>;

      switch (parameters.configurationType) {
        case WidgetConfigurationType.AGGREGATE_CHART:
          configuration = {
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: aggregateField.id,
            aggregateOperation: parameters.aggregateOperation,
          };
          break;
        case WidgetConfigurationType.BAR_CHART:
          configuration = {
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: aggregateField.id,
            aggregateOperation: parameters.aggregateOperation,
            primaryAxisGroupByFieldMetadataId: groupByField?.id,
            secondaryAxisGroupByFieldMetadataId: secondaryGroupByField?.id,
            layout: parameters.layout ?? BarChartLayout.VERTICAL,
          };
          break;
        case WidgetConfigurationType.LINE_CHART:
          configuration = {
            configurationType: WidgetConfigurationType.LINE_CHART,
            aggregateFieldMetadataId: aggregateField.id,
            aggregateOperation: parameters.aggregateOperation,
            primaryAxisGroupByFieldMetadataId: groupByField?.id,
          };
          break;
        case WidgetConfigurationType.PIE_CHART:
          configuration = {
            configurationType: WidgetConfigurationType.PIE_CHART,
            aggregateFieldMetadataId: aggregateField.id,
            aggregateOperation: parameters.aggregateOperation,
            groupByFieldMetadataId: groupByField?.id,
          };
          break;
        default:
          return {
            success: false,
            message: `Unsupported configuration type "${parameters.configurationType}"`,
          };
      }

      const validation = widgetConfigurationSchema.safeParse(configuration);

      if (!validation.success) {
        return {
          success: false,
          message: `Invalid widget configuration: ${validation.error.message}`,
          error: validation.error.message,
        };
      }

      return {
        success: true,
        message: `Built ${parameters.configurationType} configuration for ${targetObject.labelSingular}`,
        result: {
          widgetType: WidgetType.GRAPH,
          objectMetadataId: targetObject.id,
          configuration: validation.data,
          resolvedFieldMetadataIds: {
            aggregateFieldMetadataId: aggregateField.id,
            groupByFieldMetadataId: groupByField?.id ?? null,
            secondaryGroupByFieldMetadataId: secondaryGroupByField?.id ?? null,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to build widget configuration: ${error.message}`,
        error: error.message,
      };
    }
  },
});
