import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import {
  ViewSortException,
  ViewSortExceptionCode,
  ViewSortExceptionMessageKey,
  generateViewSortExceptionMessage,
  generateViewSortUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('ViewSortService', () => {
  let viewSortService: ViewSortService;
  let viewSortRepository: Repository<ViewSortEntity>;

  const mockViewSort = {
    id: 'view-sort-id',
    fieldMetadataId: 'field-id',
    viewId: 'view-id',
    workspaceId: 'workspace-id',
    direction: ViewSortDirection.ASC,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as ViewSortEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewSortService,
        {
          provide: getRepositoryToken(ViewSortEntity),
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

    viewSortService = module.get<ViewSortService>(ViewSortService);
    viewSortRepository = module.get<Repository<ViewSortEntity>>(
      getRepositoryToken(ViewSortEntity),
    );
  });

  it('should be defined', () => {
    expect(viewSortService).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return view sorts for a workspace', async () => {
      const workspaceId = 'workspace-id';
      const expectedViewSorts = [mockViewSort];

      jest
        .spyOn(viewSortRepository, 'find')
        .mockResolvedValue(expectedViewSorts);

      const result = await viewSortService.findByWorkspaceId(workspaceId);

      expect(viewSortRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(expectedViewSorts);
    });
  });

  describe('findByViewId', () => {
    it('should return view sorts for a view', async () => {
      const workspaceId = 'workspace-id';
      const viewId = 'view-id';
      const expectedViewSorts = [mockViewSort];

      jest
        .spyOn(viewSortRepository, 'find')
        .mockResolvedValue(expectedViewSorts);

      const result = await viewSortService.findByViewId(workspaceId, viewId);

      expect(viewSortRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          viewId,
          deletedAt: expect.anything(),
        },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(expectedViewSorts);
    });
  });

  describe('findById', () => {
    it('should return a view sort by id', async () => {
      const id = 'view-sort-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewSortRepository, 'findOne').mockResolvedValue(mockViewSort);

      const result = await viewSortService.findById(id, workspaceId);

      expect(viewSortRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(mockViewSort);
    });

    it('should return null when view sort is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewSortRepository, 'findOne').mockResolvedValue(null);

      const result = await viewSortService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validViewSortData = {
      fieldMetadataId: 'field-id',
      viewId: 'view-id',
      workspaceId: 'workspace-id',
      direction: ViewSortDirection.ASC,
    };

    it('should create a view sort successfully', async () => {
      jest.spyOn(viewSortRepository, 'create').mockReturnValue(mockViewSort);
      jest.spyOn(viewSortRepository, 'save').mockResolvedValue(mockViewSort);

      const result = await viewSortService.create(validViewSortData);

      expect(viewSortRepository.create).toHaveBeenCalledWith(validViewSortData);
      expect(viewSortRepository.save).toHaveBeenCalledWith(mockViewSort);
      expect(result).toEqual(mockViewSort);
    });

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = { ...validViewSortData, workspaceId: undefined };

      await expect(viewSortService.create(invalidData)).rejects.toThrow(
        new ViewSortException(
          generateViewSortExceptionMessage(
            ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
          ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
          {
            userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
              ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when viewId is missing', async () => {
      const invalidData = { ...validViewSortData, viewId: undefined };

      await expect(viewSortService.create(invalidData)).rejects.toThrow(
        new ViewSortException(
          generateViewSortExceptionMessage(
            ViewSortExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
          ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
          {
            userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
              ViewSortExceptionMessageKey.VIEW_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when fieldMetadataId is missing', async () => {
      const invalidData = { ...validViewSortData, fieldMetadataId: undefined };

      await expect(viewSortService.create(invalidData)).rejects.toThrow(
        new ViewSortException(
          generateViewSortExceptionMessage(
            ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
          ViewSortExceptionCode.INVALID_VIEW_SORT_DATA,
          {
            userFriendlyMessage: generateViewSortUserFriendlyExceptionMessage(
              ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
            ),
          },
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a view sort successfully', async () => {
      const id = 'view-sort-id';
      const workspaceId = 'workspace-id';
      const updateData = { direction: ViewSortDirection.DESC };
      const updatedViewSort = { ...mockViewSort, ...updateData };

      jest.spyOn(viewSortService, 'findById').mockResolvedValue(mockViewSort);
      jest.spyOn(viewSortRepository, 'save').mockResolvedValue(updatedViewSort);

      const result = await viewSortService.update(id, workspaceId, updateData);

      expect(viewSortService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewSortRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(result).toEqual({ ...mockViewSort, ...updatedViewSort });
    });

    it('should throw exception when view sort is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { direction: ViewSortDirection.DESC };

      jest.spyOn(viewSortService, 'findById').mockResolvedValue(null);

      await expect(
        viewSortService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new ViewSortException(
          generateViewSortExceptionMessage(
            ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
            id,
          ),
          ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a view sort successfully', async () => {
      const id = 'view-sort-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewSortService, 'findById').mockResolvedValue(mockViewSort);
      jest.spyOn(viewSortRepository, 'softDelete').mockResolvedValue({} as any);

      const result = await viewSortService.delete(id, workspaceId);

      expect(viewSortService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewSortRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewSort);
    });

    it('should throw exception when view sort is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewSortService, 'findById').mockResolvedValue(null);

      await expect(viewSortService.delete(id, workspaceId)).rejects.toThrow(
        new ViewSortException(
          generateViewSortExceptionMessage(
            ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND,
            id,
          ),
          ViewSortExceptionCode.VIEW_SORT_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroy', () => {
    it('should destroy a view sort successfully', async () => {
      const id = 'view-sort-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewSortRepository, 'findOne').mockResolvedValue(mockViewSort);
      jest.spyOn(viewSortRepository, 'delete').mockResolvedValue({} as any);

      const result = await viewSortService.destroy(id, workspaceId);

      expect(viewSortRepository.findOne).toHaveBeenCalledWith({
        where: { id, workspaceId },
        relations: ['workspace', 'view'],
        withDeleted: true,
      });
      expect(viewSortRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(true);
    });
  });
});
