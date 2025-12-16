import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';

describe('ViewQueryParamsService', () => {
  let viewQueryParamsService: ViewQueryParamsService;
  let viewService: jest.Mocked<ViewService>;
  let flatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;

  const mockWorkspaceId = 'workspace-id';
  const mockViewId = 'view-id';
  const mockObjectMetadataId = 'object-metadata-id';
  const mockFieldMetadataId = 'field-metadata-id';

  const mockFlatObjectMetadataMaps = {
    byId: {
      [mockObjectMetadataId]: {
        id: mockObjectMetadataId,
        nameSingular: 'company',
        namePlural: 'companies',
        labelSingular: 'Company',
        labelPlural: 'Companies',
      },
    },
    byNameSingular: {},
    byNamePlural: {},
  };

  const mockFlatFieldMetadataMaps = {
    byId: {
      [mockFieldMetadataId]: {
        id: mockFieldMetadataId,
        name: 'name',
        type: FieldMetadataType.TEXT,
        label: 'Name',
        options: null,
      },
    },
    byNameAndObjectId: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewQueryParamsService,
        {
          provide: ViewService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
          },
        },
      ],
    }).compile();

    viewQueryParamsService = module.get<ViewQueryParamsService>(
      ViewQueryParamsService,
    );
    viewService = module.get(ViewService);
    flatEntityMapsCacheService = module.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
  });

  it('should be defined', () => {
    expect(viewQueryParamsService).toBeDefined();
  });

  describe('resolveViewToQueryParams', () => {
    it('should throw error when view is not found', async () => {
      viewService.findById.mockResolvedValue(null);

      await expect(
        viewQueryParamsService.resolveViewToQueryParams(
          mockViewId,
          mockWorkspaceId,
        ),
      ).rejects.toThrow(`View with id ${mockViewId} not found`);
    });

    it('should return query params for a view without filters or sorts', async () => {
      const mockView = {
        id: mockViewId,
        name: 'All Companies',
        objectMetadataId: mockObjectMetadataId,
        type: ViewType.TABLE,
        visibility: ViewVisibility.WORKSPACE,
        viewFilters: [],
        viewFilterGroups: [],
        viewSorts: [],
      };

      viewService.findById.mockResolvedValue(mockView as any);
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
          flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
        } as any,
      );

      const result = await viewQueryParamsService.resolveViewToQueryParams(
        mockViewId,
        mockWorkspaceId,
      );

      expect(result.objectNameSingular).toBe('company');
      expect(result.filter).toEqual({});
      expect(result.orderBy).toEqual([]);
      expect(result.viewName).toBe('All Companies');
      expect(result.viewType).toBe(ViewType.TABLE);
    });

    it('should return query params with filters', async () => {
      const mockFilterGroupId = 'filter-group-id';
      const mockView = {
        id: mockViewId,
        name: 'Companies with Name',
        objectMetadataId: mockObjectMetadataId,
        type: ViewType.TABLE,
        visibility: ViewVisibility.WORKSPACE,
        viewFilters: [
          {
            id: 'filter-id',
            fieldMetadataId: mockFieldMetadataId,
            operand: ViewFilterOperand.CONTAINS,
            value: 'Acme',
            viewFilterGroupId: mockFilterGroupId,
            subFieldName: null,
          },
        ],
        viewFilterGroups: [
          {
            id: mockFilterGroupId,
            parentViewFilterGroupId: null,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          },
        ],
        viewSorts: [],
      };

      viewService.findById.mockResolvedValue(mockView as any);
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
          flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
        } as any,
      );

      const result = await viewQueryParamsService.resolveViewToQueryParams(
        mockViewId,
        mockWorkspaceId,
      );

      expect(result.objectNameSingular).toBe('company');
      expect(result.viewName).toBe('Companies with Name');
      expect(result.filter).toBeDefined();
    });

    it('should return query params with sorts', async () => {
      const mockView = {
        id: mockViewId,
        name: 'Companies Sorted',
        objectMetadataId: mockObjectMetadataId,
        type: ViewType.TABLE,
        visibility: ViewVisibility.WORKSPACE,
        viewFilters: [],
        viewFilterGroups: [],
        viewSorts: [
          {
            id: 'sort-id',
            fieldMetadataId: mockFieldMetadataId,
            direction: ViewSortDirection.DESC,
          },
        ],
      };

      viewService.findById.mockResolvedValue(mockView as any);
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
          flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
        } as any,
      );

      const result = await viewQueryParamsService.resolveViewToQueryParams(
        mockViewId,
        mockWorkspaceId,
      );

      expect(result.objectNameSingular).toBe('company');
      expect(result.orderBy).toHaveLength(1);
      expect(result.orderBy[0]).toHaveProperty('name');
    });

    it('should skip filters for deleted fields', async () => {
      const deletedFieldId = 'deleted-field-id';
      const mockFilterGroupId = 'filter-group-id';
      const mockView = {
        id: mockViewId,
        name: 'View with deleted field filter',
        objectMetadataId: mockObjectMetadataId,
        type: ViewType.TABLE,
        visibility: ViewVisibility.WORKSPACE,
        viewFilters: [
          {
            id: 'filter-id',
            fieldMetadataId: deletedFieldId,
            operand: ViewFilterOperand.CONTAINS,
            value: 'test',
            viewFilterGroupId: mockFilterGroupId,
            subFieldName: null,
          },
        ],
        viewFilterGroups: [
          {
            id: mockFilterGroupId,
            parentViewFilterGroupId: null,
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          },
        ],
        viewSorts: [],
      };

      viewService.findById.mockResolvedValue(mockView as any);
      flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
          flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
        } as any,
      );

      const result = await viewQueryParamsService.resolveViewToQueryParams(
        mockViewId,
        mockWorkspaceId,
      );

      // Filter should be effectively empty because the field was deleted
      expect(result.filter).toEqual({ and: [] });
    });
  });
});
