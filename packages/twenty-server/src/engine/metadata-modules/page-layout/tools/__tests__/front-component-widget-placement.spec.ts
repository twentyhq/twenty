import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { createPlaceFrontComponentTool } from 'src/engine/metadata-modules/page-layout/tools/place-front-component.tool';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { createAddPageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-widget.tool';
import { createCreateCompleteDashboardTool } from 'src/modules/dashboard/tools/create-complete-dashboard.tool';
import { createUpdatePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/update-page-layout-widget.tool';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const COMPONENT_ID = '20202020-2222-4222-8222-222222222222';
const TAB_ID = '20202020-1111-4111-8111-111111111111';
const WIDGET_ID = '20202020-3333-4333-8333-333333333333';
const CONTEXT = {
  workspaceId: 'workspace',
  authContext: {
    type: 'user',
    workspace: { id: 'workspace' },
  } as WorkspaceAuthContext,
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

const buildDependencies = (
  surface: PageLayoutType | undefined,
  {
    layoutType = PageLayoutType.DASHBOARD,
    layoutMode = PageLayoutTabLayoutMode.GRID,
    componentObjectMetadataId,
    isHeadless = false,
  }: {
    layoutType?: PageLayoutType;
    layoutMode?: PageLayoutTabLayoutMode;
    componentObjectMetadataId?: string;
    isHeadless?: boolean;
  } = {},
) => {
  const component = {
    id: COMPONENT_ID,
    name: 'Company Search',
    isHeadless,
    widgetAvailability: [
      { pageLayoutType: surface, objectMetadataId: componentObjectMetadataId },
    ],
  };

  return {
    pageLayoutService: {
      findByIdOrThrow: jest.fn().mockResolvedValue({
        id: 'layout',
        type: layoutType,
        objectMetadataId: 'company',
      }),
      create: jest.fn().mockResolvedValue({ id: 'layout' }),
      destroy: jest.fn(),
    },
    pageLayoutTabService: {
      findByIdOrThrow: jest.fn().mockResolvedValue({
        id: TAB_ID,
        pageLayoutId: 'layout',
        layoutMode,
        isActive: true,
      }),
      create: jest.fn().mockResolvedValue({ id: TAB_ID }),
    },
    pageLayoutWidgetService: {
      create: jest.fn(async ({ input }) => ({ ...input, id: WIDGET_ID })),
      update: jest.fn(async ({ updateData }) => ({
        ...updateData,
        id: WIDGET_ID,
      })),
      findByIdOrThrow: jest
        .fn()
        .mockResolvedValue({ objectMetadataId: null, pageLayoutTabId: TAB_ID }),
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
      const deps = dependencies as unknown as PageLayoutToolDependencies;

      if (operation === 'add') {
        const tool = createAddPageLayoutWidgetTool(deps, CONTEXT);

        return tool.execute(
          tool.inputSchema.parse({ ...widget, pageLayoutTabId: TAB_ID }),
        );
      }
      if (operation === 'update') {
        const tool = createUpdatePageLayoutWidgetTool(deps, CONTEXT);

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
      [PageLayoutType.RECORD_PAGE, 'not available on this page layout'],
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

describe.each(['add', 'update'] as const)(
  '%s page-layout widget on a record page',
  (operation) => {
    it('accepts a vertical-list position through the tool schema', async () => {
      const dependencies = buildDependencies(PageLayoutType.RECORD_PAGE, {
        layoutType: PageLayoutType.RECORD_PAGE,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      });
      const position = {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 2,
      } as const;

      if (operation === 'add') {
        const tool = createAddPageLayoutWidgetTool(dependencies, CONTEXT);
        const result = await tool.execute(
          tool.inputSchema.parse({
            ...WIDGET,
            pageLayoutTabId: TAB_ID,
            position,
          }),
        );

        expect(result).toMatchObject({ success: true, result: { position } });
        expect(
          dependencies.pageLayoutWidgetService.create,
        ).toHaveBeenCalledWith({
          workspaceId: CONTEXT.workspaceId,
          input: expect.objectContaining({ position }),
        });
      } else {
        const tool = createUpdatePageLayoutWidgetTool(
          dependencies as unknown as PageLayoutToolDependencies,
          CONTEXT,
        );
        const parameters = {
          widgetId: WIDGET_ID,
          configuration: CONFIGURATION,
          position,
        };

        tool.inputSchema.parse(parameters);
        const result = await tool.execute(parameters);

        expect(result).toMatchObject({ success: true, result: { position } });
        expect(
          dependencies.pageLayoutWidgetService.update,
        ).toHaveBeenCalledWith({
          id: WIDGET_ID,
          workspaceId: CONTEXT.workspaceId,
          updateData: { position, configuration: CONFIGURATION },
        });
      }
    });
  },
);

describe('place_front_component', () => {
  const place = (
    dependencies: ReturnType<typeof buildDependencies>,
    position:
      | typeof WIDGET.position
      | { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST; index: number },
  ) => {
    const tool = createPlaceFrontComponentTool(dependencies, CONTEXT);

    return tool.execute(
      tool.inputSchema.parse({
        frontComponentId: COMPONENT_ID,
        pageLayoutTabId: TAB_ID,
        title: WIDGET.title,
        position,
      }),
    );
  };
  const recordPosition = {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 2,
  } as const;

  it.each([undefined, 'company'])(
    'places a record-page component with matching object availability (%s)',
    async (componentObjectMetadataId) => {
      const dependencies = buildDependencies(PageLayoutType.RECORD_PAGE, {
        layoutType: PageLayoutType.RECORD_PAGE,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        componentObjectMetadataId,
      });

      expect(await place(dependencies, recordPosition)).toMatchObject({
        success: true,
      });
      expect(dependencies.pageLayoutWidgetService.create).toHaveBeenCalledWith({
        workspaceId: CONTEXT.workspaceId,
        input: expect.objectContaining({
          pageLayoutTabId: TAB_ID,
          position: recordPosition,
          configuration: CONFIGURATION,
        }),
      });
      expect(
        dependencies.pageLayoutTabService.findByIdOrThrow,
      ).toHaveBeenCalledWith({ id: TAB_ID, workspaceId: CONTEXT.workspaceId });
      expect(
        dependencies.pageLayoutService.findByIdOrThrow,
      ).toHaveBeenCalledWith({
        id: 'layout',
        workspaceId: CONTEXT.workspaceId,
      });
    },
  );

  it('places a dashboard component in its grid', async () => {
    const dependencies = buildDependencies(PageLayoutType.DASHBOARD);
    expect(await place(dependencies, WIDGET.position)).toMatchObject({
      success: true,
    });
  });

  it.each([
    { surface: PageLayoutType.DASHBOARD },
    {
      surface: PageLayoutType.RECORD_PAGE,
      componentObjectMetadataId: 'person',
    },
    { surface: PageLayoutType.RECORD_PAGE, isHeadless: true },
    { surface: undefined },
  ])(
    'refuses incompatible or missing components (%j)',
    async ({ surface, ...options }) => {
      const dependencies = buildDependencies(surface, {
        layoutType: PageLayoutType.RECORD_PAGE,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        ...options,
      });
      expect(await place(dependencies, recordPosition)).toMatchObject({
        success: false,
      });
      expect(
        dependencies.pageLayoutWidgetService.create,
      ).not.toHaveBeenCalled();
    },
  );

  it('refuses a grid position on a vertical-list tab', async () => {
    const dependencies = buildDependencies(PageLayoutType.RECORD_PAGE, {
      layoutType: PageLayoutType.RECORD_PAGE,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    });
    expect(await place(dependencies, WIDGET.position)).toMatchObject({
      success: false,
      error: expect.stringContaining('layout mode'),
    });
    expect(dependencies.pageLayoutWidgetService.create).not.toHaveBeenCalled();
  });

  it('refuses an inactive tab', async () => {
    const dependencies = buildDependencies(PageLayoutType.DASHBOARD);
    dependencies.pageLayoutTabService.findByIdOrThrow.mockResolvedValue({
      pageLayoutId: 'layout',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      isActive: false,
    });
    expect(await place(dependencies, WIDGET.position)).toMatchObject({
      success: false,
    });
    expect(dependencies.pageLayoutWidgetService.create).not.toHaveBeenCalled();
  });

  it('does not write when the tab cannot be found in the workspace', async () => {
    const dependencies = buildDependencies(PageLayoutType.DASHBOARD);
    dependencies.pageLayoutTabService.findByIdOrThrow.mockRejectedValue(
      new Error('Tab not found'),
    );
    expect(await place(dependencies, WIDGET.position)).toMatchObject({
      success: false,
      error: 'Tab not found',
    });
    expect(dependencies.pageLayoutWidgetService.create).not.toHaveBeenCalled();
  });
});
