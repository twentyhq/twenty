import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ViewFilterOperand } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
  ViewFilterExceptionMessageKey,
  generateViewFilterExceptionMessage,
  generateViewFilterUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('ViewFilterService', () => {
  let viewFilterService: ViewFilterService;
  let viewFilterRepository: Repository<ViewFilterEntity>;

  const mockViewFilter = {
    id: 'view-filter-id',
    fieldMetadataId: 'field-id',
    viewId: 'view-id',
    workspaceId: 'workspace-id',
    operand: ViewFilterOperand.CONTAINS,
    value: 'test',
    positionInViewFilterGroup: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as ViewFilterEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewFilterService,
        {
          provide: WorkspaceCacheStorageService,
          useValue: {
            flushGraphQLOperation: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ViewFilterEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    viewFilterService = module.get<ViewFilterService>(ViewFilterService);
    viewFilterRepository = module.get<Repository<ViewFilterEntity>>(
      getRepositoryToken(ViewFilterEntity),
    );
  });

  it('should be defined', () => {
    expect(viewFilterService).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return view filters for a workspace', async () => {
      const workspaceId = 'workspace-id';
      const expectedViewFilters = [mockViewFilter];

      jest
        .spyOn(viewFilterRepository, 'find')
        .mockResolvedValue(expectedViewFilters);

      const result = await viewFilterService.findByWorkspaceId(workspaceId);

      expect(viewFilterRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        order: { positionInViewFilterGroup: 'ASC' },
        relations: ['workspace', 'view', 'viewFilterGroup'],
      });
      expect(result).toEqual(expectedViewFilters);
    });
  });

  describe('findByViewId', () => {
    it('should return view filters for a view', async () => {
      const workspaceId = 'workspace-id';
      const viewId = 'view-id';
      const expectedViewFilters = [mockViewFilter];

      jest
        .spyOn(viewFilterRepository, 'find')
        .mockResolvedValue(expectedViewFilters);

      const result = await viewFilterService.findByViewId(workspaceId, viewId);

      expect(viewFilterRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          viewId,
          deletedAt: expect.anything(),
        },
        order: { positionInViewFilterGroup: 'ASC' },
        relations: ['workspace', 'view', 'viewFilterGroup'],
      });
      expect(result).toEqual(expectedViewFilters);
    });
  });

  describe('findById', () => {
    it('should return a view filter by id', async () => {
      const id = 'view-filter-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewFilterRepository, 'findOne')
        .mockResolvedValue(mockViewFilter);

      const result = await viewFilterService.findById(id, workspaceId);

      expect(viewFilterRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: ['workspace', 'view', 'viewFilterGroup'],
      });
      expect(result).toEqual(mockViewFilter);
    });

    it('should return null when view filter is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFilterRepository, 'findOne').mockResolvedValue(null);

      const result = await viewFilterService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validViewFilterData = {
      fieldMetadataId: 'field-id',
      viewId: 'view-id',
      workspaceId: 'workspace-id',
      operand: ViewFilterOperand.CONTAINS,
      value: 'test',
      positionInViewFilterGroup: 0,
    };

    it('should create a view filter successfully', async () => {
      jest
        .spyOn(viewFilterRepository, 'create')
        .mockReturnValue(mockViewFilter);
      jest
        .spyOn(viewFilterRepository, 'save')
        .mockResolvedValue(mockViewFilter);

      const result = await viewFilterService.create(validViewFilterData);

      expect(viewFilterRepository.create).toHaveBeenCalledWith(
        validViewFilterData,
      );
      expect(viewFilterRepository.save).toHaveBeenCalledWith(mockViewFilter);
      expect(result).toEqual(mockViewFilter);
    });

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = { ...validViewFilterData, workspaceId: undefined };

      await expect(viewFilterService.create(invalidData)).rejects.toThrow(
        new ViewFilterException(
          generateViewFilterExceptionMessage(
            ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
          ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
          {
            userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
              ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when viewId is missing', async () => {
      const invalidData = { ...validViewFilterData, viewId: undefined };

      await expect(viewFilterService.create(invalidData)).rejects.toThrow(
        new ViewFilterException(
          generateViewFilterExceptionMessage(
            ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
          ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
          {
            userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
              ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when fieldMetadataId is missing', async () => {
      const invalidData = {
        ...validViewFilterData,
        fieldMetadataId: undefined,
      };

      await expect(viewFilterService.create(invalidData)).rejects.toThrow(
        new ViewFilterException(
          generateViewFilterExceptionMessage(
            ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
          ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
          {
            userFriendlyMessage: generateViewFilterUserFriendlyExceptionMessage(
              ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
            ),
          },
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a view filter successfully', async () => {
      const id = 'view-filter-id';
      const workspaceId = 'workspace-id';
      const updateData = { value: 'updated test' };
      const updatedViewFilter = { ...mockViewFilter, ...updateData };

      jest
        .spyOn(viewFilterService, 'findById')
        .mockResolvedValue(mockViewFilter);
      jest
        .spyOn(viewFilterRepository, 'save')
        .mockResolvedValue(updatedViewFilter);

      const result = await viewFilterService.update(
        id,
        workspaceId,
        updateData,
      );

      expect(viewFilterService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewFilterRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(result).toEqual({ ...mockViewFilter, ...updatedViewFilter });
    });

    it('should throw exception when view filter is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { value: 'updated test' };

      jest.spyOn(viewFilterService, 'findById').mockResolvedValue(null);

      await expect(
        viewFilterService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new ViewFilterException(
          generateViewFilterExceptionMessage(
            ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
            id,
          ),
          ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a view filter successfully', async () => {
      const id = 'view-filter-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewFilterService, 'findById')
        .mockResolvedValue(mockViewFilter);
      jest
        .spyOn(viewFilterRepository, 'softDelete')
        .mockResolvedValue({} as any);

      const result = await viewFilterService.delete(id, workspaceId);

      expect(viewFilterService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewFilterRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewFilter);
    });

    it('should throw exception when view filter is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFilterService, 'findById').mockResolvedValue(null);

      await expect(viewFilterService.delete(id, workspaceId)).rejects.toThrow(
        new ViewFilterException(
          generateViewFilterExceptionMessage(
            ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND,
            id,
          ),
          ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroy', () => {
    it('should destroy a view filter successfully', async () => {
      const id = 'view-filter-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewFilterRepository, 'findOne')
        .mockResolvedValue(mockViewFilter);
      jest.spyOn(viewFilterRepository, 'delete').mockResolvedValue({} as any);

      const result = await viewFilterService.destroy(id, workspaceId);

      expect(viewFilterRepository.findOne).toHaveBeenCalledWith({
        where: { id, workspaceId },
        relations: ['workspace', 'view', 'viewFilterGroup'],
        withDeleted: true,
      });
      expect(viewFilterRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewFilter);
    });
  });
});
