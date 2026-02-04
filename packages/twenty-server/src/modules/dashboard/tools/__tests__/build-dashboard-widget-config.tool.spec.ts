import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { createBuildDashboardWidgetConfigTool } from 'src/modules/dashboard/tools/build-dashboard-widget-config.tool';
import { widgetConfigurationSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';

const mockWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const COMPANY_OBJECT_ID = '20202020-f3ad-452e-b5b6-2d49d3ea88b1';
const AMOUNT_FIELD_ID = '20202020-bc64-4148-8a79-b3144f743694';
const STAGE_FIELD_ID = '20202020-0487-4c26-a58c-95cda3823a74';

type ObjectMapEntry = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  isActive: boolean;
};

type FieldMapEntry = {
  id: string;
  name: string;
  label: string;
  objectMetadataId: string;
  isActive: boolean;
};

type FlatEntityMaps<T> = {
  byUniversalIdentifier: Record<string, T>;
  universalIdentifierById: Record<string, string>;
  universalIdentifiersByApplicationId: Record<string, string[]>;
};

const baseObjectMaps: FlatEntityMaps<ObjectMapEntry> = {
  byUniversalIdentifier: {
    'object-company': {
      id: COMPANY_OBJECT_ID,
      nameSingular: 'company',
      namePlural: 'companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      isActive: true,
    },
  },
  universalIdentifierById: {
    [COMPANY_OBJECT_ID]: 'object-company',
  },
  universalIdentifiersByApplicationId: {},
};

const baseFieldMaps: FlatEntityMaps<FieldMapEntry> = {
  byUniversalIdentifier: {
    'field-amount': {
      id: AMOUNT_FIELD_ID,
      name: 'amount',
      label: 'Amount',
      objectMetadataId: COMPANY_OBJECT_ID,
      isActive: true,
    },
    'field-stage': {
      id: STAGE_FIELD_ID,
      name: 'stage',
      label: 'Stage',
      objectMetadataId: COMPANY_OBJECT_ID,
      isActive: true,
    },
  },
  universalIdentifierById: {
    [AMOUNT_FIELD_ID]: 'field-amount',
    [STAGE_FIELD_ID]: 'field-stage',
  },
  universalIdentifiersByApplicationId: {},
};

const buildTool = ({
  objectMaps = baseObjectMaps,
  fieldMaps = baseFieldMaps,
}: {
  objectMaps?: typeof baseObjectMaps;
  fieldMaps?: typeof baseFieldMaps;
}) => {
  const deps = {
    flatEntityMapsCacheService: {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
      }),
    },
  };

  return createBuildDashboardWidgetConfigTool(deps as any, {
    workspaceId: mockWorkspaceId,
  });
};

describe('build_dashboard_widget_config tool', () => {
  it('resolves object by singular name and label', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'Company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    expect(result.success).toBe(true);
    expect(result.result?.objectMetadataId).toBe(COMPANY_OBJECT_ID);
  });

  it('resolves fields by label', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    expect(result.success).toBe(true);
    expect(
      result.result?.resolvedFieldMetadataIds.aggregateFieldMetadataId,
    ).toBe(AMOUNT_FIELD_ID);
  });

  it('returns ambiguity when multiple fields match', async () => {
    const tool = buildTool({
      fieldMaps: {
        ...baseFieldMaps,
        byUniversalIdentifier: {
          ...baseFieldMaps.byUniversalIdentifier,
          'field-amount-duplicate': {
            id: '20202020-7d2e-4178-8a79-c512d8ef89ab',
            name: 'amountDuplicate',
            label: 'Amount',
            objectMetadataId: COMPANY_OBJECT_ID,
            isActive: true,
          },
        },
        universalIdentifierById: {
          ...baseFieldMaps.universalIdentifierById,
          '20202020-7d2e-4178-8a79-c512d8ef89ab': 'field-amount-duplicate',
        },
      },
    });

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    expect(result.success).toBe(false);
    expect(result.candidates?.fields?.aggregateField).toHaveLength(2);
  });

  it('returns error when object not found', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'unknown',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch('No object found');
  });

  it('returns configuration that passes widget schema', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    expect(result.success).toBe(true);
    const validation = widgetConfigurationSchema.safeParse(
      result.result?.configuration,
    );

    expect(validation.success).toBe(true);
  });
});
