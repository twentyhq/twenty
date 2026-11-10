import { Test } from '@nestjs/testing';
import {
  AggregateOperations,
  PageLayoutTabLayoutMode,
  ViewFilterOperand,
  WidgetType,
} from 'twenty-shared/types';

import { PageLayoutToolService } from 'src/engine/metadata-modules/page-layout/tools/services/page-layout-tool.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { UpdatePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/update-page-layout-widget.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const WIDGET_ID = '20202020-ffff-4d02-bf25-6aeccf7ea419';
const OPPORTUNITY_OBJECT_ID = '20202020-dddd-4d02-bf25-6aeccf7ea419';
const AMOUNT_FIELD_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const STAGE_FIELD_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';

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
  pageLayoutToolService: {
    assertFrontComponentWidgetAvailableOnPageLayoutOrThrow: jest.fn(),
    computePageLayoutIdentifierMaps: jest.fn().mockResolvedValue({
      objectIdByName: {
        opportunity: OPPORTUNITY_OBJECT_ID,
        opportunities: OPPORTUNITY_OBJECT_ID,
      },
      fieldIdByObjectIdAndName: new Map([
        [`${OPPORTUNITY_OBJECT_ID}:amount`, AMOUNT_FIELD_ID],
        [`${OPPORTUNITY_OBJECT_ID}:stage`, STAGE_FIELD_ID],
      ]),
    }),
  },
});

const createTool = async (deps: ReturnType<typeof buildDeps>) => {
  const module = await Test.createTestingModule({
    providers: [
      UpdatePageLayoutWidgetTool,
      { provide: PageLayoutToolService, useValue: deps.pageLayoutToolService },
      {
        provide: PageLayoutWidgetService,
        useValue: deps.pageLayoutWidgetService,
      },
    ],
  }).compile();

  return module.get(UpdatePageLayoutWidgetTool);
};

describe('update_page_layout_widget tool', () => {
  it('resolves filter field names using the existing widget object when the object is not changed', async () => {
    const deps = buildDeps();
    const tool = await createTool(deps);

    const result = await tool.execute({
      context: { workspaceId: WORKSPACE_ID },
      input: tool.inputSchema.parse({
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
      }),
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
    const tool = await createTool(deps);

    const result = await tool.execute({
      context: { workspaceId: WORKSPACE_ID },
      input: tool.inputSchema.parse({
        widgetId: WIDGET_ID,
        objectName: 'opportunities',
        configuration: {
          configurationType: WidgetConfigurationType.AGGREGATE_CHART,
          aggregateFieldName: 'amount',
          aggregateOperation: AggregateOperations.SUM,
          displayDataLabel: false,
        },
      }),
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

  it('does not resolve identifiers when only non-field properties change', async () => {
    const deps = buildDeps();
    const tool = await createTool(deps);

    const result = await tool.execute({
      context: { workspaceId: WORKSPACE_ID },
      input: tool.inputSchema.parse({
        widgetId: WIDGET_ID,
        title: 'Renamed widget',
      }),
    });

    expect(result.success).toBe(true);
    expect(
      deps.pageLayoutToolService.computePageLayoutIdentifierMaps,
    ).not.toHaveBeenCalled();
    expect(deps.pageLayoutWidgetService.findByIdOrThrow).not.toHaveBeenCalled();

    const updateData = deps.pageLayoutWidgetService.update.mock.calls[0][0]
      .updateData as Record<string, unknown>;

    expect(updateData).toEqual({ title: 'Renamed widget' });
  });
});
