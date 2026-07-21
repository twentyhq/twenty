import { Test, type TestingModule } from '@nestjs/testing';

import {
  FieldMetadataType,
  OrderByDirection,
  ViewCalendarLayout,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { CompleteViewUpsertService } from 'src/engine/metadata-modules/view/tools/services/complete-view-upsert.service';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewToolsFactory } from 'src/engine/metadata-modules/view/tools/view-tools.factory';

describe('ViewToolsFactory', () => {
  let viewToolsFactory: ViewToolsFactory;
  let viewService: jest.Mocked<ViewService>;
  let completeViewUpsertService: jest.Mocked<CompleteViewUpsertService>;
  let viewFieldService: jest.Mocked<ViewFieldService>;
  let viewQueryParamsService: jest.Mocked<ViewQueryParamsService>;

  const mockWorkspaceId = 'workspace-id';
  const mockUserWorkspaceId = 'user-workspace-id';
  const mockViewId = 'view-id';
  const mockObjectMetadataId = 'object-metadata-id';
  const mockObjectNameSingular = 'company';
  const mockCalendarFieldMetadataId = 'calendar-field-metadata-id';
  const mockCalendarEndFieldMetadataId = 'calendar-end-field-metadata-id';

  const mockNameFieldMetadataId = 'name-field-metadata-id';
  const mockStageFieldMetadataId = 'stage-field-metadata-id';

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

    viewToolsFactory = module.get<ViewToolsFactory>(ViewToolsFactory);
    viewService = module.get(ViewService);
    completeViewUpsertService = module.get(CompleteViewUpsertService);
    viewFieldService = module.get(ViewFieldService);
    viewQueryParamsService = module.get(ViewQueryParamsService);
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

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await callExecute(tools['create_view'], {
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
        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await expect(
          callExecute(tools['create_view'], {
            name: 'Kanban View',
            objectNameSingular: mockObjectNameSingular,
            type: ViewType.KANBAN,
          }),
        ).rejects.toThrow('KANBAN views require mainGroupByFieldName');
      });

      it('should throw when CALENDAR view missing calendarFieldName', async () => {
        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await expect(
          callExecute(tools['create_view'], {
            name: 'Calendar View',
            objectNameSingular: mockObjectNameSingular,
            type: ViewType.CALENDAR,
            calendarLayout: ViewCalendarLayout.WEEK,
          }),
        ).rejects.toThrow('CALENDAR views require calendarFieldName');
      });

      it('should throw when CALENDAR view missing calendarLayout', async () => {
        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await expect(
          callExecute(tools['create_view'], {
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

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await callExecute(tools['create_view'], {
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

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['create_view'], {
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

    describe('upsert_complete_view tool', () => {
      it('should be generated alongside the other write tools', () => {
        const tools = viewToolsFactory.generateWriteTools(mockWorkspaceId);

        expect(tools).toHaveProperty('upsert_complete_view');
        expect(tools['upsert_complete_view']).toHaveProperty('description');
        expect(tools['upsert_complete_view']).toHaveProperty('inputSchema');
        expect(tools['upsert_complete_view']).toHaveProperty('execute');
      });

      it('should create a view with fields, filters, and sorts referenced by name in a single upsert call', async () => {
        completeViewUpsertService.upsertCompleteView.mockResolvedValue({
          id: 'new-view-id',
          name: 'Pipeline',
          objectMetadataId: mockObjectMetadataId,
          type: ViewType.TABLE,
          icon: 'IconList',
          visibility: ViewVisibility.WORKSPACE,
          viewFields: [{}, {}],
          viewFilters: [{}],
          viewSorts: [{}],
        } as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        const result = await callExecute(tools['upsert_complete_view'], {
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
          icon: 'IconList',
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
          icon: 'IconList',
          visibility: ViewVisibility.WORKSPACE,
          viewFields: [{}],
        } as any);

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await callExecute(tools['upsert_complete_view'], {
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
        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await expect(
          callExecute(tools['upsert_complete_view'], {
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

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await callExecute(tools['upsert_complete_view'], {
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

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await callExecute(tools['upsert_complete_view'], {
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

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await callExecute(tools['upsert_complete_view'], {
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

        const tools = viewToolsFactory.generateWriteTools(
          mockWorkspaceId,
          mockUserWorkspaceId,
        );

        await expect(
          callExecute(tools['upsert_complete_view'], {
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
