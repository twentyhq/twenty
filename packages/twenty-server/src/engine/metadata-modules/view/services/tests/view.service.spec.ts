import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('ViewService', () => {
  let viewService: ViewService;
  let viewRepository: Repository<ViewEntity>;
  let i18nService: I18nService;

  const mockView = {
    id: 'view-id',
    name: 'Test View',
    objectMetadataId: 'object-id',
    workspaceId: 'workspace-id',
    type: ViewType.TABLE,
    icon: 'test-icon',
    position: 0,
    isCompact: false,
    isCustom: true,
    key: 'INDEX',
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataId: null,
    anyFieldFilterValue: null,
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as ViewEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewService,
        {
          provide: getRepositoryToken(ViewEntity),
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
        {
          provide: I18nService,
          useValue: {
            translateMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    viewService = module.get<ViewService>(ViewService);
    viewRepository = module.get<Repository<ViewEntity>>(
      getRepositoryToken(ViewEntity),
    );
    i18nService = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(viewService).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return workspace views and user-owned unlisted views', async () => {
      const workspaceId = 'workspace-id';
      const userWorkspaceId = 'user-workspace-id';
      const workspaceView = {
        ...mockView,
        id: 'workspace-view',
        visibility: ViewVisibility.WORKSPACE,
      } as ViewEntity;
      const userUnlistedView = {
        ...mockView,
        id: 'user-unlisted-view',
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: userWorkspaceId,
      } as ViewEntity;
      const otherUserUnlistedView = {
        ...mockView,
        id: 'other-user-unlisted-view',
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: 'other-user-workspace-id',
      } as ViewEntity;
      const allViews = [workspaceView, userUnlistedView, otherUserUnlistedView];

      jest.spyOn(viewRepository, 'find').mockResolvedValue(allViews);

      const result = await viewService.findByWorkspaceId(
        workspaceId,
        userWorkspaceId,
      );

      expect(viewRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: [
          'workspace',
          'viewFields',
          'viewFilters',
          'viewSorts',
          'viewGroups',
          'viewFilterGroups',
        ],
      });
      expect(result).toEqual([workspaceView, userUnlistedView]);
      expect(result).not.toContain(otherUserUnlistedView);
    });

    it('should return only workspace views when no userWorkspaceId provided', async () => {
      const workspaceId = 'workspace-id';
      const workspaceView = {
        ...mockView,
        id: 'workspace-view',
        visibility: ViewVisibility.WORKSPACE,
      } as ViewEntity;
      const unlistedView = {
        ...mockView,
        id: 'unlisted-view',
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: 'some-user-workspace-id',
      } as ViewEntity;
      const allViews = [workspaceView, unlistedView];

      jest.spyOn(viewRepository, 'find').mockResolvedValue(allViews);

      const result = await viewService.findByWorkspaceId(workspaceId);

      expect(result).toEqual([workspaceView]);
      expect(result).not.toContain(unlistedView);
    });
  });

  describe('findByObjectMetadataId', () => {
    it('should return workspace views and user-owned unlisted views for an object', async () => {
      const workspaceId = 'workspace-id';
      const objectMetadataId = 'object-id';
      const userWorkspaceId = 'user-workspace-id';
      const workspaceView = {
        ...mockView,
        id: 'workspace-view',
        visibility: ViewVisibility.WORKSPACE,
        objectMetadataId,
      } as ViewEntity;
      const userUnlistedView = {
        ...mockView,
        id: 'user-unlisted-view',
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: userWorkspaceId,
        objectMetadataId,
      } as ViewEntity;
      const otherUserUnlistedView = {
        ...mockView,
        id: 'other-user-unlisted-view',
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: 'other-user-workspace-id',
        objectMetadataId,
      } as ViewEntity;
      const allViews = [workspaceView, userUnlistedView, otherUserUnlistedView];

      jest.spyOn(viewRepository, 'find').mockResolvedValue(allViews);

      const result = await viewService.findByObjectMetadataId(
        workspaceId,
        objectMetadataId,
        userWorkspaceId,
      );

      expect(viewRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          objectMetadataId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: [
          'workspace',
          'viewFields',
          'viewFilters',
          'viewSorts',
          'viewGroups',
          'viewFilterGroups',
        ],
      });
      expect(result).toEqual([workspaceView, userUnlistedView]);
      expect(result).not.toContain(otherUserUnlistedView);
    });

    it('should return only workspace views when no userWorkspaceId provided', async () => {
      const workspaceId = 'workspace-id';
      const objectMetadataId = 'object-id';
      const workspaceView = {
        ...mockView,
        id: 'workspace-view',
        visibility: ViewVisibility.WORKSPACE,
        objectMetadataId,
      } as ViewEntity;
      const unlistedView = {
        ...mockView,
        id: 'unlisted-view',
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: 'some-user-workspace-id',
        objectMetadataId,
      } as ViewEntity;
      const allViews = [workspaceView, unlistedView];

      jest.spyOn(viewRepository, 'find').mockResolvedValue(allViews);

      const result = await viewService.findByObjectMetadataId(
        workspaceId,
        objectMetadataId,
      );

      expect(result).toEqual([workspaceView]);
      expect(result).not.toContain(unlistedView);
    });
  });

  describe('findById', () => {
    it('should return a view by id', async () => {
      const id = 'view-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewRepository, 'findOne').mockResolvedValue(mockView);

      const result = await viewService.findById(id, workspaceId);

      expect(viewRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: [
          'workspace',
          'viewFields',
          'viewFilters',
          'viewSorts',
          'viewGroups',
          'viewFilterGroups',
        ],
      });
      expect(result).toEqual(mockView);
    });

    it('should return null when view is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewRepository, 'findOne').mockResolvedValue(null);

      const result = await viewService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validViewData = {
      name: 'Test View',
      workspaceId: 'workspace-id',
      objectMetadataId: 'object-id',
      type: ViewType.TABLE,
      icon: 'test-icon',
    };

    it('should create a view successfully', async () => {
      jest.spyOn(viewRepository, 'create').mockReturnValue(mockView);
      jest.spyOn(viewRepository, 'save').mockResolvedValue(mockView);

      const result = await viewService.create(validViewData);

      expect(viewRepository.create).toHaveBeenCalledWith({
        ...validViewData,
        isCustom: true,
      });
      expect(viewRepository.save).toHaveBeenCalledWith(mockView);
      expect(result).toEqual(mockView);
    });

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = { ...validViewData, workspaceId: undefined };

      await expect(viewService.create(invalidData)).rejects.toThrow(
        new ViewException(
          generateViewExceptionMessage(
            ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
          ViewExceptionCode.INVALID_VIEW_DATA,
          {
            userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
              ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when objectMetadataId is missing', async () => {
      const invalidData = { ...validViewData, objectMetadataId: undefined };

      await expect(viewService.create(invalidData)).rejects.toThrow(
        new ViewException(
          generateViewExceptionMessage(
            ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
          ),
          ViewExceptionCode.INVALID_VIEW_DATA,
          {
            userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
              ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
            ),
          },
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a view successfully', async () => {
      const id = 'view-id';
      const workspaceId = 'workspace-id';
      const updateData = { name: 'Updated View' };
      const updatedView = { ...mockView, ...updateData };

      jest.spyOn(viewService, 'findById').mockResolvedValue(mockView);
      jest.spyOn(viewRepository, 'save').mockResolvedValue(updatedView);

      const result = await viewService.update(id, workspaceId, updateData);

      expect(viewService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(result).toEqual({ ...mockView, ...updatedView });
    });

    it('should throw exception when view is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { name: 'Updated View' };

      jest.spyOn(viewService, 'findById').mockResolvedValue(null);

      await expect(
        viewService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new ViewException(
          generateViewExceptionMessage(
            ViewExceptionMessageKey.VIEW_NOT_FOUND,
            id,
          ),
          ViewExceptionCode.VIEW_NOT_FOUND,
        ),
      );
    });

    it('should re-allocate view to current user when changing from WORKSPACE to UNLISTED visibility', async () => {
      const id = 'view-id';
      const workspaceId = 'workspace-id';
      const userWorkspaceId = 'current-user-workspace-id';
      const workspaceView = {
        ...mockView,
        visibility: ViewVisibility.WORKSPACE,
        createdByUserWorkspaceId: null,
      } as ViewEntity;
      const updateData = { visibility: ViewVisibility.UNLISTED };
      const expectedSaveData = {
        id,
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: userWorkspaceId,
      };
      const updatedView = {
        ...workspaceView,
        ...expectedSaveData,
      };

      jest.spyOn(viewService, 'findById').mockResolvedValue(workspaceView);
      jest.spyOn(viewRepository, 'save').mockResolvedValue(updatedView);

      const result = await viewService.update(
        id,
        workspaceId,
        updateData,
        userWorkspaceId,
      );

      expect(viewService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewRepository.save).toHaveBeenCalledWith(expectedSaveData);
      expect(result.createdByUserWorkspaceId).toBe(userWorkspaceId);
    });

    it('should not change createdByUserWorkspaceId when visibility is not changing to UNLISTED', async () => {
      const id = 'view-id';
      const workspaceId = 'workspace-id';
      const userWorkspaceId = 'current-user-workspace-id';
      const updateData = { name: 'Updated Name' };
      const updatedView = { ...mockView, ...updateData };

      jest.spyOn(viewService, 'findById').mockResolvedValue(mockView);
      jest.spyOn(viewRepository, 'save').mockResolvedValue(updatedView);

      await viewService.update(id, workspaceId, updateData, userWorkspaceId);

      expect(viewRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(viewRepository.save).not.toHaveBeenCalledWith(
        expect.objectContaining({
          createdByUserWorkspaceId: userWorkspaceId,
        }),
      );
    });

    it('should not change createdByUserWorkspaceId when view is already UNLISTED', async () => {
      const id = 'view-id';
      const workspaceId = 'workspace-id';
      const userWorkspaceId = 'current-user-workspace-id';
      const originalOwner = 'original-owner-workspace-id';
      const unlistedView = {
        ...mockView,
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: originalOwner,
      } as ViewEntity;
      const updateData = { visibility: ViewVisibility.UNLISTED };
      const updatedView = { ...unlistedView, ...updateData };

      jest.spyOn(viewService, 'findById').mockResolvedValue(unlistedView);
      jest.spyOn(viewRepository, 'save').mockResolvedValue(updatedView);

      await viewService.update(id, workspaceId, updateData, userWorkspaceId);

      expect(viewRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(viewRepository.save).not.toHaveBeenCalledWith(
        expect.objectContaining({
          createdByUserWorkspaceId: userWorkspaceId,
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete a view successfully', async () => {
      const id = 'view-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewService, 'findById').mockResolvedValue(mockView);
      jest.spyOn(viewRepository, 'softDelete').mockResolvedValue({} as any);

      const result = await viewService.delete(id, workspaceId);

      expect(viewService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockView);
    });

    it('should throw exception when view is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewService, 'findById').mockResolvedValue(null);

      await expect(viewService.delete(id, workspaceId)).rejects.toThrow(
        new ViewException(
          generateViewExceptionMessage(
            ViewExceptionMessageKey.VIEW_NOT_FOUND,
            id,
          ),
          ViewExceptionCode.VIEW_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroy', () => {
    it('should destroy a view successfully', async () => {
      const id = 'view-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewService, 'findByIdIncludingDeleted')
        .mockResolvedValue(mockView);
      jest.spyOn(viewRepository, 'delete').mockResolvedValue({} as any);

      const result = await viewService.destroy(id, workspaceId);

      expect(viewService.findByIdIncludingDeleted).toHaveBeenCalledWith(
        id,
        workspaceId,
      );
      expect(viewRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(true);
    });
  });

  describe('processViewNameWithTemplate', () => {
    it('should replace template with objectLabelPlural', () => {
      const viewName = 'All {objectLabelPlural}';
      const objectLabelPlural = 'Companies';

      jest.spyOn(i18nService, 'translateMessage').mockImplementation((args) => {
        return args.messageId;
      });

      const result = viewService.processViewNameWithTemplate(
        viewName,
        false,
        objectLabelPlural,
        'en',
      );

      expect(result).toBe('All Companies');
    });

    it('should return translated value when translation exists', () => {
      const viewName = 'All {objectLabelPlural}';
      const objectLabelPlural = 'Companies';
      const translatedTemplate = 'Toutes les Companies';

      jest
        .spyOn(i18nService, 'translateMessage')
        .mockReturnValue(translatedTemplate);

      const result = viewService.processViewNameWithTemplate(
        viewName,
        false,
        objectLabelPlural,
        'fr-FR',
      );

      expect(result).toBe(translatedTemplate);
    });

    it('should not translate custom views', () => {
      const viewName = 'My Custom View';

      const result = viewService.processViewNameWithTemplate(
        viewName,
        true,
        undefined,
        'en',
      );

      expect(i18nService.translateMessage).not.toHaveBeenCalled();
      expect(result).toBe(viewName);
    });

    it('should return original name when no objectLabelPlural provided for template', () => {
      const viewName = 'All {objectLabelPlural}';

      jest.spyOn(i18nService, 'translateMessage').mockImplementation((args) => {
        return args.messageId;
      });

      const result = viewService.processViewNameWithTemplate(
        viewName,
        false,
        undefined,
        'en',
      );

      expect(result).toBe(viewName);
    });
  });
});
