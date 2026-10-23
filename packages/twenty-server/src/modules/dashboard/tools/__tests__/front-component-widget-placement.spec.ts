import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { createAddDashboardWidgetTool } from 'src/modules/dashboard/tools/add-dashboard-widget.tool';
import { createCreateCompleteDashboardTool } from 'src/modules/dashboard/tools/create-complete-dashboard.tool';
import { createUpdateDashboardWidgetTool } from 'src/modules/dashboard/tools/update-dashboard-widget.tool';
import { type DashboardToolDependencies } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const COMPONENT_ID = '20202020-2222-4222-8222-222222222222';
const TAB_ID = '20202020-1111-4111-8111-111111111111';
const WIDGET_ID = '20202020-3333-4333-8333-333333333333';
const CONTEXT = {
  workspaceId: 'workspace',
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'role' },
  },
};
const CONFIGURATION = {
  configurationType: WidgetConfigurationType.FRONT_COMPONENT,
  frontComponentId: COMPONENT_ID,
} as const;
const WIDGET = {
  title: 'Company Search',
  type: WidgetType.FRONT_COMPONENT,
  configuration: CONFIGURATION,
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 4,
    columnSpan: 6,
  },
};

const buildDependencies = (surface: PageLayoutType | undefined) => {
  const component = {
    id: COMPONENT_ID,
    name: 'Company Search',
    universalWidgetAvailability: [{ pageLayoutType: surface }],
  };

  return {
    pageLayoutService: {
      create: jest.fn().mockResolvedValue({ id: 'layout' }),
      destroy: jest.fn(),
    },
    pageLayoutTabService: {
      create: jest.fn().mockResolvedValue({ id: TAB_ID }),
    },
    pageLayoutWidgetService: {
      create: jest.fn(async ({ input }) => ({ ...input, id: WIDGET_ID })),
      update: jest.fn(async ({ updateData }) => ({
        ...updateData,
        id: WIDGET_ID,
      })),
      findByIdOrThrow: jest.fn().mockResolvedValue({ objectMetadataId: null }),
    },
    flatEntityMapsCacheService: {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: { byUniversalIdentifier: {} },
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
        flatFrontComponentMaps: {
          byUniversalIdentifier: isDefined(surface)
            ? { [COMPONENT_ID]: component }
            : {},
          universalIdentifierById: isDefined(surface)
            ? { [COMPONENT_ID]: COMPONENT_ID }
            : {},
        },
      }),
    },
    recordPositionService: {
      buildRecordPosition: jest.fn().mockResolvedValue(1),
    },
    workspaceOrmManager: {
      executeInWorkspaceContext: jest.fn(async (callback) => callback()),
      getRepository: jest.fn().mockReturnValue({ insert: jest.fn() }),
    },
  };
};

describe.each(['add', 'update', 'create'] as const)(
  '%s dashboard frontend component placement',
  (operation) => {
    const execute = (
      dependencies: ReturnType<typeof buildDependencies>,
      widget:
        | typeof WIDGET
        | (Omit<typeof WIDGET, 'type' | 'configuration'> & {
            type: WidgetType.IFRAME;
            configuration: {
              configurationType: WidgetConfigurationType.IFRAME;
              url: string;
            };
          }) = WIDGET,
    ) => {
      const deps = dependencies as unknown as DashboardToolDependencies;

      if (operation === 'add') {
        const tool = createAddDashboardWidgetTool(deps, CONTEXT);

        return tool.execute(
          tool.inputSchema.parse({ ...widget, pageLayoutTabId: TAB_ID }),
        );
      }
      if (operation === 'update') {
        const tool = createUpdateDashboardWidgetTool(deps, CONTEXT);

        const parameters = {
          widgetId: WIDGET_ID,
          configuration: widget.configuration,
        };
        tool.inputSchema.parse(parameters);

        return tool.execute(parameters);
      }
      const tool = createCreateCompleteDashboardTool(deps, CONTEXT);

      return tool.execute(
        tool.inputSchema.parse({ title: 'Sales', widgets: [widget] }),
      );
    };

    it('places a dashboard component without changing its configuration', async () => {
      const dependencies = buildDependencies(PageLayoutType.DASHBOARD);
      const result = await execute(dependencies);

      expect(result.success).toBe(true);
      if (operation === 'update') {
        expect(
          dependencies.pageLayoutWidgetService.update,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            updateData: { configuration: CONFIGURATION },
          }),
        );
      } else {
        expect(
          dependencies.pageLayoutWidgetService.create,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            input: expect.objectContaining({ configuration: CONFIGURATION }),
          }),
        );
      }
    });

    it.each([
      [PageLayoutType.RECORD_PAGE, 'not available on dashboards'],
      [undefined, 'does not exist'],
    ] as const)(
      'refuses an unavailable component (%s)',
      async (surface, error) => {
        const dependencies = buildDependencies(surface);
        const result = await execute(dependencies);

        if (operation === 'create') {
          expect(result).toMatchObject({
            success: true,
            result: { widgets: [] },
            widgetErrors: [
              { title: WIDGET.title, error: expect.stringContaining(error) },
            ],
          });
        } else {
          expect(result).toMatchObject({
            success: false,
            error: expect.stringContaining(error),
          });
        }
        expect(
          dependencies.pageLayoutWidgetService.create,
        ).not.toHaveBeenCalled();
        expect(
          dependencies.pageLayoutWidgetService.update,
        ).not.toHaveBeenCalled();
      },
    );

    it('keeps other widget configurations working without a frontend component', async () => {
      const dependencies = buildDependencies(undefined);
      const result = await execute(dependencies, {
        ...WIDGET,
        type: WidgetType.IFRAME,
        configuration: {
          configurationType: WidgetConfigurationType.IFRAME,
          url: 'https://example.com',
        },
      });

      expect(result.success).toBe(true);
    });
  },
);
