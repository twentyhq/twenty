import { Test, type TestingModule } from '@nestjs/testing';

import { OrderByDirection } from 'twenty-shared/types';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewToolsFactory } from 'src/engine/metadata-modules/view/tools/view-tools.factory';

describe('ViewToolsFactory', () => {
  let viewToolsFactory: ViewToolsFactory;
  let viewService: jest.Mocked<ViewService>;
  let viewQueryParamsService: jest.Mocked<ViewQueryParamsService>;
  let _flatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;

  const mockWorkspaceId = 'workspace-id';
  const mockUserWorkspaceId = 'user-workspace-id';
  const mockViewId = 'view-id';
  const mockObjectMetadataId = 'object-metadata-id';
  const mockObjectNameSingular = 'company';

  const mockView = {
    id: mockViewId,
    name: 'All Companies',
    objectMetadataId: mockObjectMetadataId,
    type: ViewType.TABLE,
    icon: 'IconBuilding',
    visibility: ViewVisibility.WORKSPACE,
    position: 0,
    createdByUserWorkspaceId: mockUserWorkspaceId,
  };

  const mockFlatObjectMetadataMaps = {
    byId: {
      [mockObjectMetadataId]: {
        id: mockObjectMetadataId,
        nameSingular: mockObjectNameSingular,
        namePlural: 'companies',
        labelSingular: 'Company',
        labelPlural: 'Companies',
      },
    },
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  };

  const callExecute = async (tool: any, input: any) => {
    return tool.execute(input);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewToolsFactory,
        {
          provide: ViewService,
          useValue: {
            findByWorkspaceId: jest.fn(),
            findByObjectMetadataId: jest.fn(),
            findById: jest.fn(),
            createOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: ViewQueryParamsService,
          useValue: {
            resolveViewToQueryParams: jest.fn(),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
            }),
          },
        },
      ],
    }).compile();

    viewToolsFactory = module.get<ViewToolsFactory>(ViewToolsFactory);
    viewService = module.get(ViewService);
    viewQueryParamsService = module.get(ViewQueryParamsService);
    _flatEntityMapsCacheService = module.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
  });

  it('should be defined', () => {
    expect(viewToolsFactory).toBeDefined();
  });

  describe('generateReadTools', () => {
    it('should generate get-views and get-view-query-parameters tools', () => {
      const tools = viewToolsFactory.generateReadTools(mockWorkspaceId);

      expect(tools).toHaveProperty('get_views');
      expect(tools).toHaveProperty('get_view_query_parameters');
      expect(tools['get_views']).toHaveProperty('description');
      expect(tools['get_views']).toHaveProperty('inputSchema');
      expect(tools['get_views']).toHaveProperty('execute');
      expect(tools['get_view_query_parameters']).toHaveProperty('description');
      expect(tools['get_view_query_parameters']).toHaveProperty('inputSchema');
      expect(tools['get_view_query_parameters']).toHaveProperty('execute');
    });

    describe('get_views tool', () => {
      it('should return all views when no objectNameSingular filter', async () => {
        const mockViews = [mockView];

        viewService.findByWorkspaceId.mockResolvedValue(mockViews as any);

        const tools = viewToolsFactory.generateReadTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['get_views'], {
          limit: 50,
        });

        expect(viewService.findByWorkspaceId).toHaveBeenCalledWith(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          id: mockViewId,
          name: 'All Companies',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.TABLE,
          icon: 'IconBuilding',
          visibility: ViewVisibility.WORKSPACE,
          position: 0,
        });
      });

      it('should filter views by objectNameSingular', async () => {
        const mockViews = [mockView];

        viewService.findByObjectMetadataId.mockResolvedValue(mockViews as any);

        const tools = viewToolsFactory.generateReadTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['get_views'], {
          objectNameSingular: mockObjectNameSingular,
          limit: 50,
        });

        expect(viewService.findByObjectMetadataId).toHaveBeenCalledWith(
          mockWorkspaceId,
          mockObjectMetadataId,
          mockUserWorkspaceId,
        );
        expect(result).toHaveLength(1);
      });

      it('should respect limit parameter', async () => {
        const mockViews = [
          { ...mockView, id: 'view-1' },
          { ...mockView, id: 'view-2' },
          { ...mockView, id: 'view-3' },
        ];

        viewService.findByWorkspaceId.mockResolvedValue(mockViews as any);

        const tools = viewToolsFactory.generateReadTools(mockWorkspaceId);

        const result = await callExecute(tools['get_views'], {
          limit: 2,
        });

        expect(result).toHaveLength(2);
      });
    });

    describe('get-view-query-parameters tool', () => {
      it('should return query parameters for a view', async () => {
        const mockQueryParams = {
          objectNameSingular: 'company',
          filter: { name: { ilike: '%Acme%' } },
          orderBy: [{ name: OrderByDirection.AscNullsFirst }],
          viewName: 'All Companies',
          viewType: ViewType.TABLE,
        };

        viewQueryParamsService.resolveViewToQueryParams.mockResolvedValue(
          mockQueryParams,
        );

        const tools = viewToolsFactory.generateReadTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
          'workspace-member-id',
        );

        const result = await callExecute(tools['get_view_query_parameters'], {
          viewId: mockViewId,
        });

        expect(
          viewQueryParamsService.resolveViewToQueryParams,
        ).toHaveBeenCalledWith(
          mockViewId,
          mockWorkspaceId,
          'workspace-member-id',
        );
        expect(result).toEqual(mockQueryParams);
      });
    });
  });

  describe('generateWriteTools', () => {
    it('should generate create-view, update-view, and delete-view tools', () => {
      const tools = viewToolsFactory.generateWriteTools(mockWorkspaceId);

      expect(tools).toHaveProperty('create_view');
      expect(tools).toHaveProperty('update_view');
      expect(tools).toHaveProperty('delete_view');
    });

    describe('create_view tool', () => {
      it('should create a new view', async () => {
        const createdView = {
          id: 'new-view-id',
          name: 'New View',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.TABLE,
          icon: 'IconTable',
          visibility: ViewVisibility.WORKSPACE,
        };

        viewService.createOne.mockResolvedValue(createdView as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['create_view'], {
          name: 'New View',
          objectNameSingular: mockObjectNameSingular,
          icon: 'IconTable',
        });

        expect(viewService.createOne).toHaveBeenCalledWith({
          createViewInput: {
            name: 'New View',
            objectMetadataId: mockObjectMetadataId,
            icon: 'IconTable',
            type: ViewType.TABLE,
            visibility: ViewVisibility.WORKSPACE,
          },
          workspaceId: mockWorkspaceId,
          createdByUserWorkspaceId: mockUserWorkspaceId,
        });
        expect(result).toEqual({
          id: 'new-view-id',
          name: 'New View',
          objectNameSingular: mockObjectNameSingular,
          type: ViewType.TABLE,
          icon: 'IconTable',
          visibility: ViewVisibility.WORKSPACE,
        });
      });
    });

    describe('update-view tool', () => {
      it('should update a workspace view', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.WORKSPACE,
        };
        const updatedView = {
          ...existingView,
          name: 'Updated Name',
        };

        viewService.findById.mockResolvedValue(existingView as any);
        viewService.updateOne.mockResolvedValue(updatedView as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['update_view'], {
          id: mockViewId,
          name: 'Updated Name',
        });

        expect(viewService.updateOne).toHaveBeenCalled();
        expect(result.name).toBe('Updated Name');
      });

      it('should allow updating own unlisted view', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: mockUserWorkspaceId,
        };
        const updatedView = {
          ...existingView,
          name: 'Updated Name',
        };

        viewService.findById.mockResolvedValue(existingView as any);
        viewService.updateOne.mockResolvedValue(updatedView as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['update_view'], {
          id: mockViewId,
          name: 'Updated Name',
        });

        expect(result.name).toBe('Updated Name');
      });

      it('should reject updating another users unlisted view', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: 'other-user-workspace-id',
        };

        viewService.findById.mockResolvedValue(existingView as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await expect(
          callExecute(tools['update_view'], {
            id: mockViewId,
            name: 'Updated Name',
          }),
        ).rejects.toThrow('You can only update your own unlisted views');
      });

      it('should throw error when view not found', async () => {
        viewService.findById.mockResolvedValue(null);

        const tools = viewToolsFactory.generateWriteTools(mockWorkspaceId);

        await expect(
          callExecute(tools['update_view'], {
            id: 'non-existent-id',
            name: 'Updated Name',
          }),
        ).rejects.toThrow('View with id non-existent-id not found');
      });
    });

    describe('delete-view tool', () => {
      it('should delete a workspace view', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.WORKSPACE,
        };
        const deletedView = {
          id: mockViewId,
          name: 'All Companies',
        };

        viewService.findById.mockResolvedValue(existingView as any);
        viewService.deleteOne.mockResolvedValue(deletedView as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['delete_view'], {
          id: mockViewId,
        });

        expect(viewService.deleteOne).toHaveBeenCalledWith({
          deleteViewInput: { id: mockViewId },
          workspaceId: mockWorkspaceId,
        });
        expect(result).toEqual({
          id: mockViewId,
          name: 'All Companies',
          deleted: true,
        });
      });

      it('should reject deleting another users unlisted view', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: 'other-user-workspace-id',
        };

        viewService.findById.mockResolvedValue(existingView as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await expect(
          callExecute(tools['delete_view'], {
            id: mockViewId,
          }),
        ).rejects.toThrow('You can only delete your own unlisted views');
      });
    });
  });
});
