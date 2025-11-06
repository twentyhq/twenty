import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
  ViewGroupExceptionMessageKey,
  generateViewGroupExceptionMessage,
  generateViewGroupUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { ViewGroupService } from 'src/engine/metadata-modules/view-group/services/view-group.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('ViewGroupService', () => {
  let viewGroupService: ViewGroupService;
  let viewGroupRepository: Repository<ViewGroupEntity>;

  const mockViewGroup = {
    id: 'view-group-id',
    fieldMetadataId: 'field-id',
    viewId: 'view-id',
    workspaceId: 'workspace-id',
    fieldValue: 'group-value',
    isVisible: true,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as ViewGroupEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewGroupService,
        {
          provide: getRepositoryToken(ViewGroupEntity),
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

    viewGroupService = module.get<ViewGroupService>(ViewGroupService);
    viewGroupRepository = module.get<Repository<ViewGroupEntity>>(
      getRepositoryToken(ViewGroupEntity),
    );
  });

  it('should be defined', () => {
    expect(viewGroupService).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return view groups for a workspace', async () => {
      const workspaceId = 'workspace-id';
      const expectedViewGroups = [mockViewGroup];

      jest
        .spyOn(viewGroupRepository, 'find')
        .mockResolvedValue(expectedViewGroups);

      const result = await viewGroupService.findByWorkspaceId(workspaceId);

      expect(viewGroupRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(expectedViewGroups);
    });
  });

  describe('findByViewId', () => {
    it('should return view groups for a view', async () => {
      const workspaceId = 'workspace-id';
      const viewId = 'view-id';
      const expectedViewGroups = [mockViewGroup];

      jest
        .spyOn(viewGroupRepository, 'find')
        .mockResolvedValue(expectedViewGroups);

      const result = await viewGroupService.findByViewId(workspaceId, viewId);

      expect(viewGroupRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          viewId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(expectedViewGroups);
    });
  });

  describe('findById', () => {
    it('should return a view group by id', async () => {
      const id = 'view-group-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewGroupRepository, 'findOne')
        .mockResolvedValue(mockViewGroup);

      const result = await viewGroupService.findById(id, workspaceId);

      expect(viewGroupRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(mockViewGroup);
    });

    it('should return null when view group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewGroupRepository, 'findOne').mockResolvedValue(null);

      const result = await viewGroupService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validViewGroupData = {
      fieldMetadataId: 'field-id',
      viewId: 'view-id',
      workspaceId: 'workspace-id',
      fieldValue: 'group-value',
      isVisible: true,
      position: 0,
    };

    it('should create a view group successfully', async () => {
      jest.spyOn(viewGroupRepository, 'create').mockReturnValue(mockViewGroup);
      jest.spyOn(viewGroupRepository, 'save').mockResolvedValue(mockViewGroup);

      const result = await viewGroupService.create(validViewGroupData);

      expect(viewGroupRepository.create).toHaveBeenCalledWith(
        validViewGroupData,
      );
      expect(viewGroupRepository.save).toHaveBeenCalledWith(mockViewGroup);
      expect(result).toEqual(mockViewGroup);
    });

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = { ...validViewGroupData, workspaceId: undefined };

      await expect(viewGroupService.create(invalidData)).rejects.toThrow(
        new ViewGroupException(
          generateViewGroupExceptionMessage(
            ViewGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
          ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
          {
            userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
              ViewGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when viewId is missing', async () => {
      const invalidData = { ...validViewGroupData, viewId: undefined };

      await expect(viewGroupService.create(invalidData)).rejects.toThrow(
        new ViewGroupException(
          generateViewGroupExceptionMessage(
            ViewGroupExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
          ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
          {
            userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
              ViewGroupExceptionMessageKey.VIEW_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when fieldMetadataId is missing', async () => {
      const invalidData = { ...validViewGroupData, fieldMetadataId: undefined };

      await expect(viewGroupService.create(invalidData)).rejects.toThrow(
        new ViewGroupException(
          generateViewGroupExceptionMessage(
            ViewGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
          ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
          {
            userFriendlyMessage: generateViewGroupUserFriendlyExceptionMessage(
              ViewGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
            ),
          },
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a view group successfully', async () => {
      const id = 'view-group-id';
      const workspaceId = 'workspace-id';
      const updateData = { isVisible: false };
      const updatedViewGroup = { ...mockViewGroup, ...updateData };

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(mockViewGroup);
      jest
        .spyOn(viewGroupRepository, 'save')
        .mockResolvedValue(updatedViewGroup);

      const result = await viewGroupService.update(id, workspaceId, updateData);

      expect(viewGroupService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewGroupRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(result).toEqual({ ...mockViewGroup, ...updatedViewGroup });
    });

    it('should throw exception when view group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { isVisible: false };

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(null);

      await expect(
        viewGroupService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new ViewGroupException(
          generateViewGroupExceptionMessage(
            ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
            id,
          ),
          ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a view group successfully', async () => {
      const id = 'view-group-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(mockViewGroup);
      jest
        .spyOn(viewGroupRepository, 'softDelete')
        .mockResolvedValue({} as any);

      const result = await viewGroupService.delete(id, workspaceId);

      expect(viewGroupService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewGroupRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewGroup);
    });

    it('should throw exception when view group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(null);

      await expect(viewGroupService.delete(id, workspaceId)).rejects.toThrow(
        new ViewGroupException(
          generateViewGroupExceptionMessage(
            ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND,
            id,
          ),
          ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroy', () => {
    it('should destroy a view group successfully', async () => {
      const id = 'view-group-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewGroupRepository, 'findOne')
        .mockResolvedValue(mockViewGroup);
      jest.spyOn(viewGroupRepository, 'delete').mockResolvedValue({} as any);

      const result = await viewGroupService.destroy(id, workspaceId);

      expect(viewGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id, workspaceId },
        relations: ['workspace', 'view'],
        withDeleted: true,
      });
      expect(viewGroupRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewGroup);
    });
  });
});
