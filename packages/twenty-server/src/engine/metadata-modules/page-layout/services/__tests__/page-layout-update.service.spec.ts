import { Test, type TestingModule } from '@nestjs/testing';

import { DataSource, type EntityManager } from 'typeorm';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type UpdatePageLayoutTabWithWidgetsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-tab-with-widgets.input';
import { type UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-widget-with-id.input';
import { type PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-tab.entity';
import { type PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutUpdateService } from 'src/engine/metadata-modules/page-layout/services/page-layout-update.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';

describe('PageLayoutUpdateService', () => {
  let pageLayoutUpdateService: PageLayoutUpdateService;
  let pageLayoutService: PageLayoutService;
  let pageLayoutTabService: PageLayoutTabService;
  let pageLayoutWidgetService: PageLayoutWidgetService;
  let mockTransactionManager: EntityManager;
  let mockDataSource: DataSource;

  const mockPageLayout = {
    id: 'page-layout-id',
    name: 'Test Page Layout',
    workspaceId: 'workspace-id',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: 'object-metadata-id',
    tabs: [],
    workspace: {} as WorkspaceEntity,
    objectMetadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as PageLayoutEntity;

  const mockTab = {
    id: 'tab-1',
    title: 'Test Tab',
    position: 0,
    pageLayoutId: 'page-layout-id',
    workspaceId: 'workspace-id',
    workspace: {} as WorkspaceEntity,
    pageLayout: {} as PageLayoutEntity,
    widgets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    application: {} as ApplicationEntity,
    applicationId: 'application-id',
    universalIdentifier: 'universal-identifier',
  } as PageLayoutTabEntity;

  const mockWidget = {
    id: 'widget-1',
    title: 'Test Widget',
    type: WidgetType.VIEW,
    pageLayoutTabId: 'tab-1',
    workspaceId: 'workspace-id',
    objectMetadataId: 'object-metadata-id',
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    configuration: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as PageLayoutWidgetEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTransactionManager = {} as EntityManager;
    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: mockTransactionManager,
      }),
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLayoutUpdateService,
        {
          provide: PageLayoutService,
          useValue: {
            findByIdOrThrow: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PageLayoutTabService,
          useValue: {
            findByPageLayoutId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PageLayoutWidgetService,
          useValue: {
            findByPageLayoutTabId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    pageLayoutUpdateService = module.get<PageLayoutUpdateService>(
      PageLayoutUpdateService,
    );
    pageLayoutService = module.get<PageLayoutService>(PageLayoutService);
    pageLayoutTabService =
      module.get<PageLayoutTabService>(PageLayoutTabService);
    pageLayoutWidgetService = module.get<PageLayoutWidgetService>(
      PageLayoutWidgetService,
    );
  });

  describe('updatePageLayoutWithTabs', () => {
    it('should update page layout and handle tabs', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const input = {
        name: 'Updated Page Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: 'object-metadata-id',
        tabs: [
          {
            id: 'tab-1',
            title: 'Updated Tab',
            position: 0,
            widgets: [
              {
                id: 'widget-1',
                title: 'Updated Widget',
                type: WidgetType.VIEW,
                gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
                pageLayoutTabId: 'tab-1',
                objectMetadataId: null,
                configuration: null,
              },
            ],
          },
        ],
      };

      const updatedPageLayout = {
        ...mockPageLayout,
        name: 'Updated Page Layout',
      };

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockResolvedValueOnce(mockPageLayout)
        .mockResolvedValueOnce(updatedPageLayout);
      jest
        .spyOn(pageLayoutService, 'update')
        .mockResolvedValue(updatedPageLayout);
      jest
        .spyOn(pageLayoutTabService, 'findByPageLayoutId')
        .mockResolvedValue([mockTab]);
      jest.spyOn(pageLayoutTabService, 'update').mockResolvedValue({
        ...mockTab,
        title: 'Updated Tab',
      });
      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue([mockWidget]);
      jest.spyOn(pageLayoutWidgetService, 'update').mockResolvedValue({
        ...mockWidget,
        title: 'Updated Widget',
      });

      const result = await pageLayoutUpdateService.updatePageLayoutWithTabs({
        id,
        workspaceId,
        input,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutService.findByIdOrThrow).toHaveBeenCalledWith(
        id,
        workspaceId,
        mockTransactionManager,
      );
      expect(pageLayoutService.update).toHaveBeenCalledWith(
        id,
        workspaceId,
        {
          name: 'Updated Page Layout',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: 'object-metadata-id',
        },
        mockTransactionManager,
      );
      expect(result).toEqual(updatedPageLayout);
    });

    it('should throw error when page layout is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const input = {
        name: 'Updated Page Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: 'object-metadata-id',
        tabs: [],
      };

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockRejectedValue(new Error('Page layout not found'));

      await expect(
        pageLayoutUpdateService.updatePageLayoutWithTabs({
          id,
          workspaceId,
          input,
          transactionManager: mockTransactionManager,
        }),
      ).rejects.toThrow('Page layout not found');
    });
  });

  describe('updatePageLayoutTabs', () => {
    it('should create new tabs', async () => {
      const pageLayoutId = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const tabs = [
        {
          id: 'new-tab-id',
          title: 'New Tab',
          position: 0,
          widgets: [],
        },
      ];

      jest
        .spyOn(pageLayoutTabService, 'findByPageLayoutId')
        .mockResolvedValue([]);
      jest.spyOn(pageLayoutTabService, 'create').mockResolvedValue({
        ...mockTab,
        id: 'new-tab-id',
        title: 'New Tab',
        position: 0,
      });
      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue([]);

      await pageLayoutUpdateService['updatePageLayoutTabs']({
        pageLayoutId,
        workspaceId,
        tabs,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutTabService.create).toHaveBeenCalledWith(
        {
          id: 'new-tab-id',
          title: 'New Tab',
          position: 0,
          pageLayoutId,
          widgets: [],
        },
        workspaceId,
        mockTransactionManager,
      );
    });

    it('should update existing tabs', async () => {
      const pageLayoutId = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const tabs = [
        {
          id: 'tab-1',
          title: 'Updated Tab',
          position: 0,
          widgets: [],
        },
      ];

      jest
        .spyOn(pageLayoutTabService, 'findByPageLayoutId')
        .mockResolvedValue([mockTab]);
      jest.spyOn(pageLayoutTabService, 'update').mockResolvedValue({
        ...mockTab,
        title: 'Updated Tab',
      });
      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue([]);

      await pageLayoutUpdateService['updatePageLayoutTabs']({
        pageLayoutId,
        workspaceId,
        tabs,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutTabService.update).toHaveBeenCalledWith(
        'tab-1',
        workspaceId,
        {
          id: 'tab-1',
          title: 'Updated Tab',
          position: 0,
        },
        mockTransactionManager,
      );
    });

    it('should delete removed tabs', async () => {
      const pageLayoutId = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const tabs: UpdatePageLayoutTabWithWidgetsInput[] = [];
      const existingTabs = [mockTab];

      jest
        .spyOn(pageLayoutTabService, 'findByPageLayoutId')
        .mockResolvedValue(existingTabs);
      jest.spyOn(pageLayoutTabService, 'delete').mockResolvedValue(mockTab);

      await pageLayoutUpdateService['updatePageLayoutTabs']({
        pageLayoutId,
        workspaceId,
        tabs,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutTabService.delete).toHaveBeenCalledWith(
        'tab-1',
        workspaceId,
        mockTransactionManager,
      );
    });

    it('should handle tabs with mixed operations (create, update, delete)', async () => {
      const pageLayoutId = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const tabs = [
        {
          id: 'tab-1',
          title: 'Updated Tab',
          position: 0,
          widgets: [],
        },
        {
          id: 'new-tab-id',
          title: 'New Tab',
          position: 1,
          widgets: [],
        },
      ];
      const existingTabs = [
        mockTab,
        {
          ...mockTab,
          id: 'tab-to-delete',
          title: 'Tab to Delete',
        },
      ] as PageLayoutTabEntity[];

      jest
        .spyOn(pageLayoutTabService, 'findByPageLayoutId')
        .mockResolvedValue(existingTabs);
      jest.spyOn(pageLayoutTabService, 'update').mockResolvedValue({
        ...mockTab,
        title: 'Updated Tab',
      });
      jest.spyOn(pageLayoutTabService, 'create').mockResolvedValue({
        ...mockTab,
        id: 'new-tab-id',
        title: 'New Tab',
        position: 1,
      });
      jest.spyOn(pageLayoutTabService, 'delete').mockResolvedValue({
        ...mockTab,
        id: 'tab-to-delete',
        title: 'Tab to Delete',
      });
      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue([]);

      await pageLayoutUpdateService['updatePageLayoutTabs']({
        pageLayoutId,
        workspaceId,
        tabs,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutTabService.delete).toHaveBeenCalledWith(
        'tab-to-delete',
        workspaceId,
        mockTransactionManager,
      );
      expect(pageLayoutTabService.update).toHaveBeenCalledWith(
        'tab-1',
        workspaceId,
        {
          id: 'tab-1',
          title: 'Updated Tab',
          position: 0,
        },
        mockTransactionManager,
      );
      expect(pageLayoutTabService.create).toHaveBeenCalledWith(
        {
          id: 'new-tab-id',
          title: 'New Tab',
          position: 1,
          pageLayoutId,
          widgets: [],
        },
        workspaceId,
        mockTransactionManager,
      );
    });
  });

  describe('updateWidgetsForTab', () => {
    it('should create new widgets', async () => {
      const tabId = 'tab-1';
      const workspaceId = 'workspace-id';
      const widgets = [
        {
          id: 'new-widget-id',
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          title: 'New Widget',
          type: WidgetType.VIEW,
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        },
      ];

      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue([]);
      jest.spyOn(pageLayoutWidgetService, 'create').mockResolvedValue({
        ...mockWidget,
        id: 'new-widget-id',
        title: 'New Widget',
        pageLayoutTabId: tabId,
        objectMetadataId: null,
        configuration: null,
        gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
      });

      await pageLayoutUpdateService['updateWidgetsForTab']({
        tabId,
        widgets,
        workspaceId,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutWidgetService.create).toHaveBeenCalledWith(
        {
          id: 'new-widget-id',
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          title: 'New Widget',
          type: WidgetType.VIEW,
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        },
        workspaceId,
        mockTransactionManager,
      );
    });

    it('should update existing widgets', async () => {
      const tabId = 'tab-1';
      const workspaceId = 'workspace-id';
      const widgets = [
        {
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          id: 'widget-1',
          title: 'Updated Widget',
          type: WidgetType.VIEW,
          gridPosition: { row: 1, column: 1, rowSpan: 2, columnSpan: 2 },
        },
      ];

      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue([mockWidget]);
      jest.spyOn(pageLayoutWidgetService, 'update').mockResolvedValue({
        ...mockWidget,
        title: 'Updated Widget',
        gridPosition: { row: 1, column: 1, rowSpan: 2, columnSpan: 2 },
      });

      await pageLayoutUpdateService['updateWidgetsForTab']({
        tabId,
        widgets,
        workspaceId,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutWidgetService.update).toHaveBeenCalledWith(
        'widget-1',
        workspaceId,
        {
          id: 'widget-1',
          title: 'Updated Widget',
          type: WidgetType.VIEW,
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          gridPosition: { row: 1, column: 1, rowSpan: 2, columnSpan: 2 },
        },
        mockTransactionManager,
      );
    });

    it('should delete removed widgets', async () => {
      const tabId = 'tab-1';
      const workspaceId = 'workspace-id';
      const widgets: UpdatePageLayoutWidgetWithIdInput[] = [];
      const existingWidgets = [mockWidget];

      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue(existingWidgets);
      jest
        .spyOn(pageLayoutWidgetService, 'delete')
        .mockResolvedValue(mockWidget);

      await pageLayoutUpdateService['updateWidgetsForTab']({
        tabId,
        widgets,
        workspaceId,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutWidgetService.delete).toHaveBeenCalledWith(
        'widget-1',
        workspaceId,
        mockTransactionManager,
      );
    });

    it('should handle widgets with mixed operations (create, update, delete)', async () => {
      const tabId = 'tab-1';
      const workspaceId = 'workspace-id';
      const widgets = [
        {
          id: 'widget-1',
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          title: 'Updated Widget',
          type: WidgetType.VIEW,
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        },
        {
          id: 'new-widget-id',
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          title: 'New Widget',
          type: WidgetType.FIELDS,
          gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 2 },
        },
      ];
      const existingWidgets = [
        mockWidget,
        {
          ...mockWidget,
          id: 'widget-to-delete',
          title: 'Widget to Delete',
        },
      ] as PageLayoutWidgetEntity[];

      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue(existingWidgets);
      jest.spyOn(pageLayoutWidgetService, 'update').mockResolvedValue({
        ...mockWidget,
        title: 'Updated Widget',
      });
      jest.spyOn(pageLayoutWidgetService, 'create').mockResolvedValue({
        ...mockWidget,
        id: 'new-widget-id',
        title: 'New Widget',
        type: WidgetType.FIELDS,
        gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 2 },
      });
      jest.spyOn(pageLayoutWidgetService, 'delete').mockResolvedValue({
        ...mockWidget,
        id: 'widget-to-delete',
        title: 'Widget to Delete',
      });

      await pageLayoutUpdateService['updateWidgetsForTab']({
        tabId,
        widgets,
        workspaceId,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutWidgetService.delete).toHaveBeenCalledWith(
        'widget-to-delete',
        workspaceId,
        mockTransactionManager,
      );
      expect(pageLayoutWidgetService.update).toHaveBeenCalledWith(
        'widget-1',
        workspaceId,
        {
          id: 'widget-1',
          title: 'Updated Widget',
          type: WidgetType.VIEW,
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
        },
        mockTransactionManager,
      );
      expect(pageLayoutWidgetService.create).toHaveBeenCalledWith(
        {
          id: 'new-widget-id',
          title: 'New Widget',
          type: WidgetType.FIELDS,
          pageLayoutTabId: tabId,
          objectMetadataId: null,
          configuration: null,
          gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 2 },
        },
        workspaceId,
        mockTransactionManager,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete page layout update with nested tabs and widgets', async () => {
      const id = 'page-layout-id';
      const workspaceId = 'workspace-id';
      const input = {
        name: 'Complete Layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            id: 'tab-1',
            title: 'Tab 1',
            position: 0,
            widgets: [
              {
                id: 'widget-1',
                title: 'Widget 1',
                type: WidgetType.VIEW,
                gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
                pageLayoutTabId: 'tab-1',
                objectMetadataId: null,
                configuration: null,
              },
              {
                id: 'widget-2',
                title: 'Widget 2',
                type: WidgetType.FIELDS,
                gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 2 },
                pageLayoutTabId: 'tab-1',
                objectMetadataId: null,
                configuration: null,
              },
            ],
          },
          {
            id: 'tab-2',
            title: 'Tab 2',
            position: 1,
            widgets: [],
          },
        ],
      };

      const existingTabs = [mockTab];
      const existingWidgets = [mockWidget];
      const completeLayout = { ...mockPageLayout, name: 'Complete Layout' };

      jest
        .spyOn(pageLayoutService, 'findByIdOrThrow')
        .mockResolvedValueOnce(mockPageLayout)
        .mockResolvedValueOnce(completeLayout);
      jest.spyOn(pageLayoutService, 'update').mockResolvedValue(completeLayout);
      jest
        .spyOn(pageLayoutTabService, 'findByPageLayoutId')
        .mockResolvedValue(existingTabs);
      jest.spyOn(pageLayoutTabService, 'update').mockResolvedValue({
        ...mockTab,
        id: 'tab-1',
        title: 'Tab 1',
        position: 0,
      });
      jest.spyOn(pageLayoutTabService, 'create').mockResolvedValue({
        ...mockTab,
        id: 'tab-2',
        title: 'Tab 2',
        position: 1,
      });
      jest
        .spyOn(pageLayoutWidgetService, 'findByPageLayoutTabId')
        .mockResolvedValue(existingWidgets);
      jest.spyOn(pageLayoutWidgetService, 'update').mockResolvedValue({
        ...mockWidget,
        id: 'widget-1',
        title: 'Widget 1',
      });
      jest.spyOn(pageLayoutWidgetService, 'create').mockResolvedValue({
        ...mockWidget,
        id: 'widget-2',
        title: 'Widget 2',
        type: WidgetType.FIELDS,
        gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 2 },
      });

      const result = await pageLayoutUpdateService.updatePageLayoutWithTabs({
        id,
        workspaceId,
        input,
        transactionManager: mockTransactionManager,
      });

      expect(pageLayoutService.update).toHaveBeenCalledWith(
        id,
        workspaceId,
        {
          name: 'Complete Layout',
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
        },
        mockTransactionManager,
      );
      expect(pageLayoutTabService.update).toHaveBeenCalled();
      expect(pageLayoutTabService.create).toHaveBeenCalled();
      expect(pageLayoutWidgetService.update).toHaveBeenCalled();
      expect(pageLayoutWidgetService.create).toHaveBeenCalled();
      expect(result).toEqual(completeLayout);
    });
  });
});
