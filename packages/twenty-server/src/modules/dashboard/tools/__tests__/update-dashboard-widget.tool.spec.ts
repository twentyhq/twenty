import {
  AggregateOperations,
  PageLayoutTabLayoutMode,
  ViewFilterOperand,
  WidgetType,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type DashboardToolDependencies } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';
import { createUpdateDashboardWidgetTool } from 'src/modules/dashboard/tools/update-dashboard-widget.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const WIDGET_ID = '20202020-ffff-4d02-bf25-6aeccf7ea419';
const OPPORTUNITY_OBJECT_ID = '20202020-dddd-4d02-bf25-6aeccf7ea419';
const AMOUNT_FIELD_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const STAGE_FIELD_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';
const OWNER_FIELD_ID = '20202020-1111-4d02-bf25-6aeccf7ea419';
const WORKSPACE_MEMBER_OBJECT_ID = '20202020-2222-4d02-bf25-6aeccf7ea419';
const WORKSPACE_MEMBER_NAME_FIELD_ID = '20202020-3333-4d02-bf25-6aeccf7ea419';

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    'object-opportunity': {
      id: OPPORTUNITY_OBJECT_ID,
      nameSingular: 'opportunity',
      namePlural: 'opportunities',
    },
    'object-workspace-member': {
      id: WORKSPACE_MEMBER_OBJECT_ID,
      nameSingular: 'workspaceMember',
      namePlural: 'workspaceMembers',
    },
  },
};

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'field-amount': {
      id: AMOUNT_FIELD_ID,
      name: 'amount',
      label: 'Amount',
      objectMetadataId: OPPORTUNITY_OBJECT_ID,
      isActive: true,
      type: 'CURRENCY',
    },
    'field-stage': {
      id: STAGE_FIELD_ID,
      name: 'stage',
      label: 'Stage',
      objectMetadataId: OPPORTUNITY_OBJECT_ID,
      isActive: true,
      type: 'SELECT',
    },
    'field-owner': {
      id: OWNER_FIELD_ID,
      name: 'owner',
      label: 'Owner',
      objectMetadataId: OPPORTUNITY_OBJECT_ID,
      isActive: true,
      type: 'RELATION',
      relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
    },
    'field-workspace-member-name': {
      id: WORKSPACE_MEMBER_NAME_FIELD_ID,
      name: 'name',
      label: 'Name',
      objectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
      isActive: true,
      type: 'FULL_NAME',
    },
  },
};

const buildDeps = () => ({
  pageLayoutWidgetService: {
    findByIdOrThrow: jest
      .fn()
      .mockResolvedValue({ objectMetadataId: OPPORTUNITY_OBJECT_ID }),
    update: jest.fn().mockImplementation(async ({ updateData }) => ({
      id: WIDGET_ID,
      title: 'Widget',
      type: WidgetType.GRAPH,
      position: {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 0,
        column: 0,
        rowSpan: 4,
        columnSpan: 4,
      },
      configuration: updateData.configuration,
    })),
  },
  flatEntityMapsCacheService: {
    getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
  },
});

const createTool = (deps: ReturnType<typeof buildDeps>) =>
  createUpdateDashboardWidgetTool(
    deps as unknown as Pick<
      DashboardToolDependencies,
      'pageLayoutWidgetService' | 'flatEntityMapsCacheService'
    >,
    { workspaceId: WORKSPACE_ID },
  );

describe('update_dashboard_widget tool', () => {
  it('resolves filter field names using the existing widget object when the object is not changed', async () => {
    const deps = buildDeps();
    const tool = createTool(deps);

    const result = await tool.execute({
      widgetId: WIDGET_ID,
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldName: 'amount',
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        filter: {
          recordFilters: [
            {
              fieldName: 'stage',
              operand: ViewFilterOperand.IS,
              value: '["WON"]',
            },
          ],
        },
      },
    });

    expect(result.success).toBe(true);
    expect(deps.pageLayoutWidgetService.findByIdOrThrow).toHaveBeenCalledWith({
      id: WIDGET_ID,
      workspaceId: WORKSPACE_ID,
    });

    const updateData = deps.pageLayoutWidgetService.update.mock.calls[0][0]
      .updateData as {
      configuration: {
        aggregateFieldMetadataId: string;
        filter: { recordFilters: Array<Record<string, unknown>> };
      };
    };

    expect(updateData.configuration.aggregateFieldMetadataId).toBe(
      AMOUNT_FIELD_ID,
    );
    expect(updateData.configuration.filter.recordFilters[0]).toMatchObject({
      fieldMetadataId: STAGE_FIELD_ID,
      operand: ViewFilterOperand.IS,
    });
    expect(updateData.configuration.filter.recordFilters[0]).not.toHaveProperty(
      'fieldName',
    );
  });

  it('resolves objectName to a UUID and uses it to resolve field names', async () => {
    const deps = buildDeps();
    const tool = createTool(deps);

    const result = await tool.execute({
      widgetId: WIDGET_ID,
      objectName: 'opportunities',
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldName: 'amount',
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
      },
    });

    expect(result.success).toBe(true);
    expect(deps.pageLayoutWidgetService.findByIdOrThrow).not.toHaveBeenCalled();

    const updateData = deps.pageLayoutWidgetService.update.mock.calls[0][0]
      .updateData as {
      objectMetadataId: string;
      objectName?: string;
      configuration: { aggregateFieldMetadataId: string };
    };

    expect(updateData.objectMetadataId).toBe(OPPORTUNITY_OBJECT_ID);
    expect(updateData).not.toHaveProperty('objectName');
    expect(updateData.configuration.aggregateFieldMetadataId).toBe(
      AMOUNT_FIELD_ID,
    );
  });

  it('passes dashboardFilterBindings through to the stored configuration untouched', async () => {
    const deps = buildDeps();
    const tool = createTool(deps);

    const dashboardFilterBindings = {
      stage: { fieldMetadataId: STAGE_FIELD_ID },
      amount: null,
    };

    const result = await tool.execute({
      widgetId: WIDGET_ID,
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldName: 'amount',
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        dashboardFilterBindings,
      },
    });

    expect(result.success).toBe(true);

    const updateData = deps.pageLayoutWidgetService.update.mock.calls[0][0]
      .updateData as {
      configuration: { dashboardFilterBindings: unknown };
    };

    expect(updateData.configuration.dashboardFilterBindings).toEqual(
      dashboardFilterBindings,
    );
  });

  it('resolves binding field names, including the relation target against the related object', async () => {
    const deps = buildDeps();
    const tool = createTool(deps);

    const result = await tool.execute({
      widgetId: WIDGET_ID,
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldName: 'amount',
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        dashboardFilterBindings: {
          stage: { fieldName: 'stage' },
          owner: {
            fieldName: 'owner',
            relationTargetFieldName: 'name',
            subFieldName: 'firstName',
          },
        },
      },
    });

    expect(result.success).toBe(true);

    const updateData = deps.pageLayoutWidgetService.update.mock.calls[0][0]
      .updateData as {
      configuration: { dashboardFilterBindings: unknown };
    };

    expect(updateData.configuration.dashboardFilterBindings).toEqual({
      stage: { fieldMetadataId: STAGE_FIELD_ID },
      owner: {
        fieldMetadataId: OWNER_FIELD_ID,
        relationTargetFieldMetadataId: WORKSPACE_MEMBER_NAME_FIELD_ID,
        subFieldName: 'firstName',
      },
    });
  });

  it('fails when a binding names a field the widget object does not have', async () => {
    const deps = buildDeps();
    const tool = createTool(deps);

    const result = await tool.execute({
      widgetId: WIDGET_ID,
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldName: 'amount',
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        dashboardFilterBindings: { date: { fieldName: 'closedAt' } },
      },
    });

    expect(result.success).toBe(false);
    expect(deps.pageLayoutWidgetService.update).not.toHaveBeenCalled();
  });

  it('fails when a relation target name is given for a field that is not a relation', async () => {
    const deps = buildDeps();
    const tool = createTool(deps);

    const result = await tool.execute({
      widgetId: WIDGET_ID,
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldName: 'amount',
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        dashboardFilterBindings: {
          stage: { fieldName: 'stage', relationTargetFieldName: 'name' },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(deps.pageLayoutWidgetService.update).not.toHaveBeenCalled();
  });

  it('does not resolve identifiers when only non-field properties change', async () => {
    const deps = buildDeps();
    const tool = createTool(deps);

    const result = await tool.execute({
      widgetId: WIDGET_ID,
      title: 'Renamed widget',
    });

    expect(result.success).toBe(true);
    expect(
      deps.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps,
    ).not.toHaveBeenCalled();
    expect(deps.pageLayoutWidgetService.findByIdOrThrow).not.toHaveBeenCalled();

    const updateData = deps.pageLayoutWidgetService.update.mock.calls[0][0]
      .updateData as Record<string, unknown>;

    expect(updateData).toEqual({ title: 'Renamed widget' });
  });
});
