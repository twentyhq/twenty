import { FieldMetadataType } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { createGetDashboardTool } from 'src/modules/dashboard/tools/get-dashboard.tool';
import { type DashboardToolDependencies } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';

const AGG_FIELD_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const OWNER_FIELD_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';
const PERSON_OBJECT_ID = '20202020-dddd-4d02-bf25-6aeccf7ea419';
const PERSON_ADDRESS_FIELD_ID = '20202020-eeee-4d02-bf25-6aeccf7ea419';

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'field-amount': {
      id: AGG_FIELD_ID,
      name: 'amount',
      label: 'Amount',
      objectMetadataId: 'company',
      isActive: true,
      type: FieldMetadataType.NUMBER,
    },
    'field-owner': {
      id: OWNER_FIELD_ID,
      name: 'owner',
      label: 'Owner',
      objectMetadataId: 'company',
      isActive: true,
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: PERSON_OBJECT_ID,
    },
    'field-person-address': {
      id: PERSON_ADDRESS_FIELD_ID,
      name: 'address',
      label: 'Address',
      objectMetadataId: PERSON_OBJECT_ID,
      isActive: true,
      type: FieldMetadataType.ADDRESS,
    },
  },
  universalIdentifierById: {
    [AGG_FIELD_ID]: 'field-amount',
    [OWNER_FIELD_ID]: 'field-owner',
    [PERSON_ADDRESS_FIELD_ID]: 'field-person-address',
  },
  universalIdentifiersByApplicationId: {},
};

describe('get_dashboard tool', () => {
  it('adds resolved fields to configuration', async () => {
    const dashboard = {
      id: 'dashboard-1',
      title: 'Test Dashboard',
      pageLayoutId: 'layout-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pageLayout = {
      id: 'layout-1',
      name: 'Layout',
      tabs: [
        {
          id: 'tab-1',
          title: 'Tab',
          position: 0,
          widgets: [
            {
              id: 'widget-1',
              title: 'Widget',
              type: 'GRAPH',
              gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
              objectMetadataId: 'company',
              configuration: {
                configurationType: WidgetConfigurationType.BAR_CHART,
                aggregateFieldMetadataId: AGG_FIELD_ID,
                aggregateOperation: 'COUNT',
                primaryAxisGroupByFieldMetadataId: OWNER_FIELD_ID,
                primaryAxisGroupBySubFieldName: 'address.addressCity',
                layout: 'VERTICAL',
              },
            },
            {
              id: 'widget-2',
              title: 'Widget 2',
              type: 'GRAPH',
              gridPosition: { row: 4, column: 0, rowSpan: 4, columnSpan: 4 },
              objectMetadataId: 'company',
              configuration: {
                configurationType: WidgetConfigurationType.BAR_CHART,
                aggregateFieldMetadataId: 'missing-field',
                aggregateOperation: 'COUNT',
                primaryAxisGroupByFieldMetadataId: 'missing-groupby',
                layout: 'VERTICAL',
              },
            },
          ],
        },
      ],
    };

    const deps = {
      pageLayoutService: {
        findByIdOrThrow: jest.fn().mockResolvedValue(pageLayout),
      },
      globalWorkspaceOrmManager: {
        executeInWorkspaceContext: jest
          .fn()
          .mockImplementation(async (fn) => fn()),
        getRepository: jest.fn().mockResolvedValue({
          findOne: jest.fn().mockResolvedValue(dashboard),
        }),
      },
      flatEntityMapsCacheService: {
        getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
          flatFieldMetadataMaps,
        }),
      },
    };

    const tool = createGetDashboardTool(
      deps as unknown as Pick<
        DashboardToolDependencies,
        | 'pageLayoutService'
        | 'globalWorkspaceOrmManager'
        | 'flatEntityMapsCacheService'
      >,
      {
        workspaceId: WORKSPACE_ID,
      },
    );

    const result = await tool.execute({ dashboardId: dashboard.id });

    expect(result.success).toBe(true);
    const widgets = result.result?.layout?.tabs?.[0]?.widgets ?? [];

    const configuration = widgets[0]?.configuration as
      | {
          _resolved?: {
            aggregateField?: { fieldLabel?: string };
            primaryAxisGroupBy?: { fullPath?: string; subFieldLabel?: string };
          };
        }
      | undefined;

    expect(configuration?._resolved?.aggregateField?.fieldLabel).toBe('Amount');
    expect(configuration?._resolved?.primaryAxisGroupBy?.fullPath).toBe(
      'owner.address.addressCity',
    );
    expect(configuration?._resolved?.primaryAxisGroupBy?.subFieldLabel).toBe(
      'Address City',
    );

    const missingResolved = (
      widgets[1]?.configuration as { _resolved?: unknown } | undefined
    )?._resolved;

    expect(missingResolved).toBeUndefined();
  });
});
