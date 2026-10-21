import { Test, type TestingModule } from '@nestjs/testing';

import {
  FieldActorSource,
  FieldMetadataType,
  OrderByDirection,
  ViewCalendarLayout,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { type BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { CompleteViewUpsertService } from 'src/engine/metadata-modules/view/tools/services/complete-view-upsert.service';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { CreateViewTool } from 'src/engine/metadata-modules/view/tools/create-view.tool';
import { DeleteViewTool } from 'src/engine/metadata-modules/view/tools/delete-view.tool';
import { GetViewQueryParametersTool } from 'src/engine/metadata-modules/view/tools/get-view-query-parameters.tool';
import { GetViewsTool } from 'src/engine/metadata-modules/view/tools/get-views.tool';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';
import { ViewToolIdentifierService } from 'src/engine/metadata-modules/view/tools/services/view-tool-identifier.service';
import { UpdateViewTool } from 'src/engine/metadata-modules/view/tools/update-view.tool';
import { UpsertCompleteViewTool } from 'src/engine/metadata-modules/view/tools/upsert-complete-view.tool';

describe('View tools', () => {
  let testingModule: TestingModule;
  let viewService: jest.Mocked<ViewService>;
  let completeViewUpsertService: jest.Mocked<CompleteViewUpsertService>;
  let viewFieldService: jest.Mocked<ViewFieldService>;
  let viewQueryParamsService: jest.Mocked<ViewQueryParamsService>;

  const mockWorkspaceId = 'workspace-id';
  const mockUserWorkspaceId = 'user-workspace-id';
  const mockViewId = 'c1f4b2a0-7d3e-4a8b-9c1d-2e3f4a5b6c7d';
  const mockObjectMetadataId = 'object-metadata-id';
  const mockObjectNameSingular = 'company';
  const mockCalendarFieldMetadataId = 'f4c7e5d3-0a6b-4dbe-af4a-5b6c7d8e9fa0';
  const mockCalendarEndFieldMetadataId = 'a5d8f6e4-1b7c-4ecf-b05b-6c7d8e9fa0b1';

  const mockNameFieldMetadataId = 'd2a5c3b1-8e4f-4b9c-8d2e-3f4a5b6c7d8e';
  const mockStageFieldMetadataId = 'e3b6d4c2-9f5a-4cad-9e3f-4a5b6c7d8e9f';

  const mockFlatFieldMetadataMaps = {
    byUniversalIdentifier: {
      'field-universal-id': {
        id: mockCalendarFieldMetadataId,
        name: 'dueAt',
        type: FieldMetadataType.DATE_TIME,
        objectMetadataId: mockObjectMetadataId,
        universalIdentifier: 'field-universal-id',
      },
      'end-field-universal-id': {
        id: mockCalendarEndFieldMetadataId,
        name: 'endsAt',
        type: FieldMetadataType.DATE_TIME,
        objectMetadataId: mockObjectMetadataId,
        universalIdentifier: 'end-field-universal-id',
      },
      'name-field-universal-id': {
        id: mockNameFieldMetadataId,
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: mockObjectMetadataId,
        universalIdentifier: 'name-field-universal-id',
      },
      'stage-field-universal-id': {
        id: mockStageFieldMetadataId,
        name: 'stage',
        type: FieldMetadataType.SELECT,
        objectMetadataId: mockObjectMetadataId,
        universalIdentifier: 'stage-field-universal-id',
      },
    },
  };

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
    byUniversalIdentifier: {
      'object-universal-id': {
        id: mockObjectMetadataId,
        nameSingular: mockObjectNameSingular,
        namePlural: 'companies',
        labelSingular: 'Company',
        labelPlural: 'Companies',
        universalIdentifier: 'object-universal-id',
      },
    },
    universalIdentifierById: {
      [mockObjectMetadataId]: 'object-universal-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetViewsTool,
        GetViewQueryParametersTool,
        UpsertCompleteViewTool,
        CreateViewTool,
        UpdateViewTool,
        DeleteViewTool,
        ViewToolAccessService,
        ViewToolIdentifierService,
        {
          provide: ViewService,
          useValue: {
            findByWorkspaceId: jest.fn(),
            findByObjectMetadataId: jest.fn(),
            findById: jest.fn(),
            findByIdWithRelations: jest.fn(),
            createOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: CompleteViewUpsertService,
          useValue: {
            upsertCompleteView: jest.fn(),
          },
        },
        {
          provide: ViewFieldService,
          useValue: {
            createMany: jest.fn().mockResolvedValue([]),
            findByViewId: jest.fn().mockResolvedValue([]),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: ViewFilterService,
          useValue: {
            createOne: jest.fn(),
            findByViewId: jest.fn().mockResolvedValue([]),
            deleteOne: jest.fn(),
          },
        },
        {
          provide: ViewSortService,
          useValue: {
            createOne: jest.fn(),
            findByViewId: jest.fn().mockResolvedValue([]),
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
              flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
            }),
          },
        },
      ],
    }).compile();

    testingModule = module;
    viewService = module.get(ViewService);
    completeViewUpsertService = module.get(CompleteViewUpsertService);
    viewFieldService = module.get(ViewFieldService);
    viewQueryParamsService = module.get(ViewQueryParamsService);
  });

  // Parses like the registry does, so schema defaults reach execute
  const toToolExecutor = ({
    tool,
    context,
  }: {
    tool: BaseTool;
    context: ToolProviderContext;
  }) => ({
    execute: async (input: unknown) =>
      tool.execute({
        input: await tool.inputSchema.parseAsync(input),
        context,
      }),
  });

  const buildViewTools = ({
    workspaceId,
    userWorkspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    workspaceMemberId?: string;
  }) => {
    const context: ToolProviderContext = {
      workspaceId,
      userWorkspaceId,
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
      actorContext: workspaceMemberId
        ? {
            source: FieldActorSource.MANUAL,
            workspaceMemberId,
            name: 'Member',
            context: {},
          }
        : undefined,
    };

    return {
      get_views: toToolExecutor({
        tool: testingModule.get(GetViewsTool),
        context,
      }),
      get_view_query_parameters: toToolExecutor({
        tool: testingModule.get(GetViewQueryParametersTool),
        context,
      }),
      upsert_complete_view: toToolExecutor({
        tool: testingModule.get(UpsertCompleteViewTool),
        context,
      }),
      create_view: toToolExecutor({
        tool: testingModule.get(CreateViewTool),
        context,
      }),
      update_view: toToolExecutor({
        tool: testingModule.get(UpdateViewTool),
        context,
      }),
      delete_view: toToolExecutor({
        tool: testingModule.get(DeleteViewTool),
        context,
      }),
    };
  };

  describe('read tools', () => {
    describe('get_views tool', () => {
      it('should return all views when no objectNameSingular filter', async () => {
        const mockViews = [mockView];

        viewService.findByWorkspaceId.mockResolvedValue(mockViews as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.get_views.execute({
          limit: 50,
        });

        expect(viewService.findByWorkspaceId).toHaveBeenCalledWith(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );
        expect(result).toEqual({
          views: [
            {
              id: mockViewId,
              name: 'All Companies',
              objectMetadataId: mockObjectMetadataId,
              type: ViewType.TABLE,
              icon: 'IconBuilding',
              visibility: ViewVisibility.WORKSPACE,
              position: 0,
            },
          ],
        });
      });

      it('should filter views by objectNameSingular', async () => {
        const mockViews = [mockView];

        viewService.findByObjectMetadataId.mockResolvedValue(mockViews as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.get_views.execute({
          objectNameSingular: mockObjectNameSingular,
          limit: 50,
        });

        expect(viewService.findByObjectMetadataId).toHaveBeenCalledWith(
          mockWorkspaceId,
          mockObjectMetadataId,
          mockUserWorkspaceId,
        );
        expect(result).toHaveProperty('views.length', 1);
      });

      it('should respect limit parameter', async () => {
        const mockViews = [
          { ...mockView, id: 'view-1' },
          { ...mockView, id: 'view-2' },
          { ...mockView, id: 'view-3' },
        ];

        viewService.findByWorkspaceId.mockResolvedValue(mockViews as any);

        const tools = buildViewTools({ workspaceId: mockWorkspaceId });

        const { result } = await tools.get_views.execute({
          limit: 2,
        });

        expect(result).toHaveProperty('views.length', 2);
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

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
          workspaceMemberId: 'workspace-member-id',
        });

        const { result } = await tools.get_view_query_parameters.execute({
          viewId: mockViewId,
        });

        expect(
          viewQueryParamsService.resolveViewToQueryParams,
        ).toHaveBeenCalledWith({
          viewId: mockViewId,
          workspaceId: mockWorkspaceId,
          currentWorkspaceMemberId: 'workspace-member-id',
          currentUserWorkspaceId: mockUserWorkspaceId,
        });
        expect(result).toEqual(mockQueryParams);
      });
    });
  });

  describe('write tools', () => {
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

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.create_view.execute({
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

      it('should create view fields when fieldNames is provided', async () => {
        const createdView = {
          id: 'new-view-id',
          name: 'Kanban View',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.KANBAN,
          icon: 'IconLayoutKanban',
          visibility: ViewVisibility.WORKSPACE,
        };

        viewService.createOne.mockResolvedValue(createdView as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await tools.create_view.execute({
          name: 'Kanban View',
          objectNameSingular: mockObjectNameSingular,
          icon: 'IconLayoutKanban',
          type: ViewType.KANBAN,
          mainGroupByFieldName: 'stage',
          fieldNames: ['name', 'stage'],
        });

        expect(viewFieldService.createMany).toHaveBeenCalledWith({
          createViewFieldInputs: [
            {
              viewId: 'new-view-id',
              fieldMetadataId: mockNameFieldMetadataId,
              isVisible: true,
              size: 150,
              position: 0,
            },
            {
              viewId: 'new-view-id',
              fieldMetadataId: mockStageFieldMetadataId,
              isVisible: true,
              size: 150,
              position: 1,
            },
          ],
          workspaceId: mockWorkspaceId,
        });
      });

      it('should throw when KANBAN view missing mainGroupByFieldName', async () => {
        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await expect(
          tools.create_view.execute({
            name: 'Kanban View',
            objectNameSingular: mockObjectNameSingular,
            type: ViewType.KANBAN,
          }),
        ).rejects.toThrow('KANBAN views require mainGroupByFieldName');
      });

      it('should throw when CALENDAR view missing calendarFieldName', async () => {
        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await expect(
          tools.create_view.execute({
            name: 'Calendar View',
            objectNameSingular: mockObjectNameSingular,
            type: ViewType.CALENDAR,
            calendarLayout: ViewCalendarLayout.WEEK,
          }),
        ).rejects.toThrow('CALENDAR views require calendarFieldName');
      });

      it('should throw when CALENDAR view missing calendarLayout', async () => {
        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await expect(
          tools.create_view.execute({
            name: 'Calendar View',
            objectNameSingular: mockObjectNameSingular,
            type: ViewType.CALENDAR,
            calendarFieldName: 'dueAt',
          }),
        ).rejects.toThrow('CALENDAR views require calendarLayout');
      });

      it('should not create view fields when fieldNames is not provided', async () => {
        const createdView = {
          id: 'new-view-id',
          name: 'New View',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.TABLE,
          icon: 'IconTable',
          visibility: ViewVisibility.WORKSPACE,
        };

        viewService.createOne.mockResolvedValue(createdView as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await tools.create_view.execute({
          name: 'New View',
          objectNameSingular: mockObjectNameSingular,
          icon: 'IconTable',
        });

        expect(viewFieldService.createMany).not.toHaveBeenCalled();
      });

      it('should create a calendar view with layout and field', async () => {
        const createdView = {
          id: 'new-calendar-view-id',
          name: 'Calendar View',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.CALENDAR,
          icon: 'IconCalendar',
          visibility: ViewVisibility.WORKSPACE,
        };

        viewService.createOne.mockResolvedValue(createdView as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.create_view.execute({
          name: 'Calendar View',
          objectNameSingular: mockObjectNameSingular,
          icon: 'IconCalendar',
          type: ViewType.CALENDAR,
          calendarLayout: ViewCalendarLayout.WEEK,
          calendarFieldName: 'dueAt',
        });

        expect(viewService.createOne).toHaveBeenCalledWith({
          createViewInput: {
            name: 'Calendar View',
            objectMetadataId: mockObjectMetadataId,
            icon: 'IconCalendar',
            type: ViewType.CALENDAR,
            visibility: ViewVisibility.WORKSPACE,
            calendarLayout: ViewCalendarLayout.WEEK,
            calendarFieldMetadataId: mockCalendarFieldMetadataId,
          },
          workspaceId: mockWorkspaceId,
          createdByUserWorkspaceId: mockUserWorkspaceId,
        });
        expect(result).toEqual({
          id: 'new-calendar-view-id',
          name: 'Calendar View',
          objectNameSingular: mockObjectNameSingular,
          type: ViewType.CALENDAR,
          icon: 'IconCalendar',
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

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.update_view.execute({
          id: mockViewId,
          name: 'Updated Name',
        });

        expect(viewService.updateOne).toHaveBeenCalled();
        expect(result).toMatchObject({ name: 'Updated Name' });
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

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.update_view.execute({
          id: mockViewId,
          name: 'Updated Name',
        });

        expect(result).toMatchObject({ name: 'Updated Name' });
      });

      it('should reject updating another users unlisted view', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: 'other-user-workspace-id',
        };

        viewService.findById.mockResolvedValue(existingView as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await expect(
          tools.update_view.execute({
            id: mockViewId,
            name: 'Updated Name',
          }),
        ).rejects.toThrow('You can only update your own unlisted views');
      });

      it('should throw error when view not found', async () => {
        viewService.findById.mockResolvedValue(null);

        const tools = buildViewTools({ workspaceId: mockWorkspaceId });

        await expect(
          tools.update_view.execute({
            id: 'b6e9a7f5-2c8d-4fd0-8c6c-7d8e9fa0b1c2',
            name: 'Updated Name',
          }),
        ).rejects.toThrow(
          'View with id b6e9a7f5-2c8d-4fd0-8c6c-7d8e9fa0b1c2 not found',
        );
      });
    });

    describe('upsert_complete_view tool', () => {
      it('should create a view with fields, filters, and sorts referenced by name in a single upsert call', async () => {
        completeViewUpsertService.upsertCompleteView.mockResolvedValue({
          id: 'new-view-id',
          name: 'Pipeline',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.TABLE,
          icon: 'IconTable',
          visibility: ViewVisibility.WORKSPACE,
          viewFields: [{}, {}],
          viewFilters: [{}],
          viewSorts: [{}],
        } as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.upsert_complete_view.execute({
          objectNameSingular: mockObjectNameSingular,
          name: 'Pipeline',
          type: ViewType.TABLE,
          fields: [{ fieldName: 'name' }, { fieldName: 'stage' }],
          filters: [{ fieldName: 'stage', operand: 'IS_NOT', value: ['WON'] }],
          sorts: [{ fieldName: 'name', direction: 'DESC' }],
        });

        expect(viewService.createOne).not.toHaveBeenCalled();
        expect(
          completeViewUpsertService.upsertCompleteView,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            workspaceId: mockWorkspaceId,
            userWorkspaceId: mockUserWorkspaceId,
            existingViewId: undefined,
            objectMetadataId: mockObjectMetadataId,
            name: 'Pipeline',
            type: ViewType.TABLE,
            fields: [
              {
                fieldMetadataId: mockNameFieldMetadataId,
                isVisible: true,
                size: 150,
              },
              {
                fieldMetadataId: mockStageFieldMetadataId,
                isVisible: true,
                size: 150,
              },
            ],
            filters: [
              {
                fieldMetadataId: mockStageFieldMetadataId,
                operand: 'IS_NOT',
                value: ['WON'],
                subFieldName: undefined,
              },
            ],
            sorts: [
              { fieldMetadataId: mockNameFieldMetadataId, direction: 'DESC' },
            ],
          }),
        );
        expect(result).toEqual({
          id: 'new-view-id',
          name: 'Pipeline',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.TABLE,
          icon: 'IconTable',
          visibility: ViewVisibility.WORKSPACE,
          fieldCount: 2,
          filterCount: 1,
          sortCount: 1,
        });
      });

      it('should accept a field referenced by fieldMetadataId without name resolution', async () => {
        completeViewUpsertService.upsertCompleteView.mockResolvedValue({
          id: 'new-view-id',
          name: 'By Id',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.TABLE,
          icon: 'IconTable',
          visibility: ViewVisibility.WORKSPACE,
          viewFields: [{}],
        } as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await tools.upsert_complete_view.execute({
          objectNameSingular: mockObjectNameSingular,
          name: 'By Id',
          fields: [{ fieldMetadataId: mockStageFieldMetadataId }],
        });

        expect(
          completeViewUpsertService.upsertCompleteView,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            fields: [
              {
                fieldMetadataId: mockStageFieldMetadataId,
                isVisible: true,
                size: 150,
              },
            ],
          }),
        );
      });

      it('should require objectNameSingular when creating', async () => {
        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await expect(
          tools.upsert_complete_view.execute({
            name: 'Missing object',
            fields: [{ fieldName: 'name' }],
          }),
        ).rejects.toThrow('objectNameSingular is required');
      });

      it('should delegate filter replacement to upsertCompleteView when updating', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.WORKSPACE,
        };

        viewService.findById.mockResolvedValue(existingView as any);
        completeViewUpsertService.upsertCompleteView.mockResolvedValue({
          ...existingView,
          viewFilters: [{}],
        } as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await tools.upsert_complete_view.execute({
          id: mockViewId,
          filters: [{ fieldName: 'stage', operand: 'IS', value: ['WON'] }],
        });

        expect(
          completeViewUpsertService.upsertCompleteView,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            existingViewId: mockViewId,
            objectMetadataId: mockObjectMetadataId,
            filters: [
              {
                fieldMetadataId: mockStageFieldMetadataId,
                operand: 'IS',
                value: ['WON'],
                subFieldName: undefined,
              },
            ],
          }),
        );
        expect(viewService.createOne).not.toHaveBeenCalled();
      });

      it('should resolve and update the calendar end field on an existing view', async () => {
        const existingView = {
          ...mockView,
          type: ViewType.CALENDAR,
          visibility: ViewVisibility.WORKSPACE,
        };

        viewService.findById.mockResolvedValue(existingView as any);
        completeViewUpsertService.upsertCompleteView.mockResolvedValue({
          ...existingView,
          calendarEndFieldMetadataId: mockCalendarEndFieldMetadataId,
        } as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await tools.upsert_complete_view.execute({
          id: mockViewId,
          calendarEndFieldName: 'endsAt',
        });

        expect(
          completeViewUpsertService.upsertCompleteView,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            existingViewId: mockViewId,
            objectMetadataId: mockObjectMetadataId,
            calendarEndFieldMetadataId: mockCalendarEndFieldMetadataId,
          }),
        );
      });

      it('should pass an empty sorts array through to upsertCompleteView on update', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.WORKSPACE,
        };

        viewService.findById.mockResolvedValue(existingView as any);
        completeViewUpsertService.upsertCompleteView.mockResolvedValue({
          ...existingView,
          viewSorts: [],
        } as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await tools.upsert_complete_view.execute({
          id: mockViewId,
          sorts: [],
        });

        expect(
          completeViewUpsertService.upsertCompleteView,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            existingViewId: mockViewId,
            sorts: [],
          }),
        );
      });

      it('should reject updating another users unlisted view', async () => {
        const existingView = {
          ...mockView,
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: 'other-user-workspace-id',
        };

        viewService.findById.mockResolvedValue(existingView as any);

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await expect(
          tools.upsert_complete_view.execute({
            id: mockViewId,
            name: 'Updated',
          }),
        ).rejects.toThrow('You can only update your own unlisted views');
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

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        const { result } = await tools.delete_view.execute({
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

        const tools = buildViewTools({
          workspaceId: mockWorkspaceId,
          userWorkspaceId: mockUserWorkspaceId,
        });

        await expect(
          tools.delete_view.execute({
            id: mockViewId,
          }),
        ).rejects.toThrow('You can only delete your own unlisted views');
      });
    });
  });
});
