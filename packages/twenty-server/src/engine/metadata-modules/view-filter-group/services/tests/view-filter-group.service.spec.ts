import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import {
  ViewFilterGroupException,
  ViewFilterGroupExceptionCode,
  ViewFilterGroupExceptionMessageKey,
  generateViewFilterGroupExceptionMessage,
  generateViewFilterGroupUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

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
          provide: WorkspaceCacheStorageService,
          useValue: {
            flushGraphQLOperation: jest.fn(),
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

  describe('create', () => {
    const validViewFilterGroupData = {
      viewId: 'view-id',
      workspaceId: 'workspace-id',
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
      positionInViewFilterGroup: 0,
    };

    it('should create a view filter group successfully', async () => {
      jest
        .spyOn(viewFilterGroupRepository, 'create')
        .mockReturnValue(mockViewFilterGroup);
      jest
        .spyOn(viewFilterGroupRepository, 'save')
        .mockResolvedValue(mockViewFilterGroup);

      const result = await viewFilterGroupService.create(
        validViewFilterGroupData,
      );

      expect(viewFilterGroupRepository.create).toHaveBeenCalledWith(
        validViewFilterGroupData,
      );
      expect(viewFilterGroupRepository.save).toHaveBeenCalledWith(
        mockViewFilterGroup,
      );
      expect(result).toEqual(mockViewFilterGroup);
    });

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = {
        ...validViewFilterGroupData,
        workspaceId: undefined,
      };

      await expect(viewFilterGroupService.create(invalidData)).rejects.toThrow(
        new ViewFilterGroupException(
          generateViewFilterGroupExceptionMessage(
            ViewFilterGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
          ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
          {
            userFriendlyMessage:
              generateViewFilterGroupUserFriendlyExceptionMessage(
                ViewFilterGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
              ),
          },
        ),
      );
    });

    it('should throw exception when viewId is missing', async () => {
      const invalidData = { ...validViewFilterGroupData, viewId: undefined };

      await expect(viewFilterGroupService.create(invalidData)).rejects.toThrow(
        new ViewFilterGroupException(
          generateViewFilterGroupExceptionMessage(
            ViewFilterGroupExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
          ViewFilterGroupExceptionCode.INVALID_VIEW_FILTER_GROUP_DATA,
          {
            userFriendlyMessage:
              generateViewFilterGroupUserFriendlyExceptionMessage(
                ViewFilterGroupExceptionMessageKey.VIEW_ID_REQUIRED,
              ),
          },
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a view filter group successfully', async () => {
      const id = 'view-filter-group-id';
      const workspaceId = 'workspace-id';
      const updateData = { logicalOperator: ViewFilterGroupLogicalOperator.OR };
      const updatedViewFilterGroup = { ...mockViewFilterGroup, ...updateData };

      jest
        .spyOn(viewFilterGroupService, 'findById')
        .mockResolvedValue(mockViewFilterGroup);
      jest
        .spyOn(viewFilterGroupRepository, 'save')
        .mockResolvedValue(updatedViewFilterGroup);

      const result = await viewFilterGroupService.update(
        id,
        workspaceId,
        updateData,
      );

      expect(viewFilterGroupService.findById).toHaveBeenCalledWith(
        id,
        workspaceId,
      );
      expect(viewFilterGroupRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(result).toEqual({
        ...mockViewFilterGroup,
        ...updatedViewFilterGroup,
      });
    });

    it('should throw exception when view filter group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { logicalOperator: ViewFilterGroupLogicalOperator.OR };

      jest.spyOn(viewFilterGroupService, 'findById').mockResolvedValue(null);

      await expect(
        viewFilterGroupService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new ViewFilterGroupException(
          generateViewFilterGroupExceptionMessage(
            ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
            id,
          ),
          ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a view filter group successfully', async () => {
      const id = 'view-filter-group-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewFilterGroupService, 'findById')
        .mockResolvedValue(mockViewFilterGroup);
      jest
        .spyOn(viewFilterGroupRepository, 'softDelete')
        .mockResolvedValue({} as any);

      const result = await viewFilterGroupService.delete(id, workspaceId);

      expect(viewFilterGroupService.findById).toHaveBeenCalledWith(
        id,
        workspaceId,
      );
      expect(viewFilterGroupRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewFilterGroup);
    });

    it('should throw exception when view filter group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFilterGroupService, 'findById').mockResolvedValue(null);

      await expect(
        viewFilterGroupService.delete(id, workspaceId),
      ).rejects.toThrow(
        new ViewFilterGroupException(
          generateViewFilterGroupExceptionMessage(
            ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND,
            id,
          ),
          ViewFilterGroupExceptionCode.VIEW_FILTER_GROUP_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroy', () => {
    it('should destroy a view filter group successfully', async () => {
      const id = 'view-filter-group-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewFilterGroupRepository, 'findOne')
        .mockResolvedValue(mockViewFilterGroup);
      jest
        .spyOn(viewFilterGroupRepository, 'delete')
        .mockResolvedValue({} as any);

      const result = await viewFilterGroupService.destroy(id, workspaceId);

      expect(viewFilterGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id, workspaceId },
        relations: [
          'workspace',
          'view',
          'viewFilters',
          'parentViewFilterGroup',
          'childViewFilterGroups',
        ],
        withDeleted: true,
      });
      expect(viewFilterGroupRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(true);
    });
  });
});
