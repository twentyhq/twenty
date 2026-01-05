import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

describe('ViewFilterGroupService', () => {
  let viewFilterGroupService: ViewFilterGroupService;
  let viewFilterGroupRepository: Repository<ViewFilterGroupEntity>;

  const mockViewFilterGroup = {
    id: 'view-filter-group-id',
    viewId: 'view-id',
    workspaceId: 'workspace-id',
    logicalOperator: ViewFilterGroupLogicalOperator.AND,
    positionInViewFilterGroup: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as ViewFilterGroupEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewFilterGroupService,
        {
          provide: getRepositoryToken(ViewFilterGroupEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunWorkspaceMigration: jest.fn(),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
            invalidateFlatEntityMaps: jest.fn(),
          },
        },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    viewFilterGroupService = module.get<ViewFilterGroupService>(
      ViewFilterGroupService,
    );
    viewFilterGroupRepository = module.get<Repository<ViewFilterGroupEntity>>(
      getRepositoryToken(ViewFilterGroupEntity),
    );
  });

  it('should be defined', () => {
    expect(viewFilterGroupService).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return view filter groups for a workspace', async () => {
      const workspaceId = 'workspace-id';
      const expectedViewFilterGroups = [mockViewFilterGroup];

      jest
        .spyOn(viewFilterGroupRepository, 'find')
        .mockResolvedValue(expectedViewFilterGroups);

      const result =
        await viewFilterGroupService.findByWorkspaceId(workspaceId);

      expect(viewFilterGroupRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        order: { positionInViewFilterGroup: 'ASC' },
        relations: [
          'workspace',
          'view',
          'viewFilters',
          'parentViewFilterGroup',
          'childViewFilterGroups',
        ],
      });
      expect(result).toEqual(expectedViewFilterGroups);
    });
  });

  describe('findByViewId', () => {
    it('should return view filter groups for a view', async () => {
      const workspaceId = 'workspace-id';
      const viewId = 'view-id';
      const expectedViewFilterGroups = [mockViewFilterGroup];

      jest
        .spyOn(viewFilterGroupRepository, 'find')
        .mockResolvedValue(expectedViewFilterGroups);

      const result = await viewFilterGroupService.findByViewId(
        workspaceId,
        viewId,
      );

      expect(viewFilterGroupRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          viewId,
          deletedAt: expect.anything(),
        },
        order: { positionInViewFilterGroup: 'ASC' },
        relations: [
          'workspace',
          'view',
          'viewFilters',
          'parentViewFilterGroup',
          'childViewFilterGroups',
        ],
      });
      expect(result).toEqual(expectedViewFilterGroups);
    });
  });

  describe('findById', () => {
    it('should return a view filter group by id', async () => {
      const id = 'view-filter-group-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewFilterGroupRepository, 'findOne')
        .mockResolvedValue(mockViewFilterGroup);

      const result = await viewFilterGroupService.findById(id, workspaceId);

      expect(viewFilterGroupRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: [
          'workspace',
          'view',
          'viewFilters',
          'parentViewFilterGroup',
          'childViewFilterGroups',
        ],
      });
      expect(result).toEqual(mockViewFilterGroup);
    });

    it('should return null when view filter group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFilterGroupRepository, 'findOne').mockResolvedValue(null);

      const result = await viewFilterGroupService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });
});
