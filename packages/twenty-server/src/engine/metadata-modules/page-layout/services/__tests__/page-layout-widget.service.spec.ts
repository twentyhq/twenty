import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout-widget.exception';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout/services/page-layout-widget.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

describe('PageLayoutWidgetService', () => {
  let service: PageLayoutWidgetService;
  let repository: Repository<PageLayoutWidgetEntity>;
  let workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;
  let workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;

  const workspaceId = 'workspace-id';

  const mockWidget: PageLayoutWidgetEntity = {
    id: 'widget-id',
    title: 'Test Widget',
    type: WidgetType.VIEW,
    pageLayoutTabId: 'tab-id',
    workspaceId,
    objectMetadataId: null,
    gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
    configuration: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    universalIdentifier: 'widget-id',
    applicationId: null,
  } as PageLayoutWidgetEntity;

  const mockFlatPageLayoutWidgetMaps = {
    byId: {
      'widget-id': {
        ...mockWidget,
        universalIdentifier: 'widget-id',
      },
    },
    byPageLayoutTabId: {
      'tab-id': ['widget-id'],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageLayoutWidgetService,
        {
          provide: getRepositoryToken(PageLayoutWidgetEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
            restore: jest.fn(),
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
          },
        },
      ],
    }).compile();

    service = module.get<PageLayoutWidgetService>(PageLayoutWidgetService);
    repository = module.get<Repository<PageLayoutWidgetEntity>>(
      getRepositoryToken(PageLayoutWidgetEntity),
    );
    workspaceMigrationValidateBuildAndRunService =
      module.get<WorkspaceMigrationValidateBuildAndRunService>(
        WorkspaceMigrationValidateBuildAndRunService,
      );
    workspaceManyOrAllFlatEntityMapsCacheService =
      module.get<WorkspaceManyOrAllFlatEntityMapsCacheService>(
        WorkspaceManyOrAllFlatEntityMapsCacheService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return widgets for workspace', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockWidget]);

      const result = await service.findByWorkspaceId(workspaceId);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual([mockWidget]);
    });
  });

  describe('findByPageLayoutTabId', () => {
    it('should return widgets for tab', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockWidget]);

      const result = await service.findByPageLayoutTabId(
        workspaceId,
        'tab-id',
        false,
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          pageLayoutTabId: 'tab-id',
          deletedAt: expect.anything(),
        },
        order: { createdAt: 'ASC' },
        withDeleted: false,
      });
      expect(result).toEqual([mockWidget]);
    });

    it('should return widgets including deleted when withDeleted is true', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockWidget]);

      const result = await service.findByPageLayoutTabId(
        workspaceId,
        'tab-id',
        true,
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          pageLayoutTabId: 'tab-id',
        },
        order: { createdAt: 'ASC' },
        withDeleted: true,
      });
      expect(result).toEqual([mockWidget]);
    });
  });

  describe('findById', () => {
    it('should return widget when found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockWidget);

      const result = await service.findById('widget-id', workspaceId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'widget-id',
          workspaceId,
          deletedAt: expect.anything(),
        },
      });
      expect(result).toEqual(mockWidget);
    });

    it('should return null when widget not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findById('non-existent-id', workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('findByIdOrThrow', () => {
    it('should return widget when found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockWidget);

      const result = await service.findByIdOrThrow('widget-id', workspaceId);

      expect(result).toEqual(mockWidget);
    });

    it('should throw exception when widget not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findByIdOrThrow('non-existent-id', workspaceId),
      ).rejects.toThrow(PageLayoutWidgetException);

      await expect(
        service.findByIdOrThrow('non-existent-id', workspaceId),
      ).rejects.toMatchObject({
        code: PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      });
    });
  });

  describe('createOne', () => {
    it('should create a widget successfully', async () => {
      const input = {
        title: 'New Widget',
        type: WidgetType.VIEW,
        pageLayoutTabId: 'tab-id',
        gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
      };

      jest
        .spyOn(
          workspaceManyOrAllFlatEntityMapsCacheService,
          'getOrRecomputeManyOrAllFlatEntityMaps',
        )
        .mockResolvedValueOnce({
          flatPageLayoutWidgetMaps: { byId: {} },
        } as never)
        .mockResolvedValueOnce({
          flatPageLayoutWidgetMaps: mockFlatPageLayoutWidgetMaps,
        } as never);

      jest
        .spyOn(
          workspaceMigrationValidateBuildAndRunService,
          'validateBuildAndRunWorkspaceMigration',
        )
        .mockResolvedValue(undefined);

      const result = await service.createOne({
        createPageLayoutWidgetInput: input,
        workspaceId,
      });

      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('updateOne', () => {
    it('should update a widget successfully', async () => {
      const updateInput = {
        id: 'widget-id',
        update: { title: 'Updated Widget' },
      };

      jest
        .spyOn(
          workspaceManyOrAllFlatEntityMapsCacheService,
          'getOrRecomputeManyOrAllFlatEntityMaps',
        )
        .mockResolvedValueOnce({
          flatPageLayoutWidgetMaps: mockFlatPageLayoutWidgetMaps,
        } as never)
        .mockResolvedValueOnce({
          flatPageLayoutWidgetMaps: {
            ...mockFlatPageLayoutWidgetMaps,
            byId: {
              'widget-id': {
                ...mockFlatPageLayoutWidgetMaps.byId['widget-id'],
                title: 'Updated Widget',
              },
            },
          },
        } as never);

      jest
        .spyOn(
          workspaceMigrationValidateBuildAndRunService,
          'validateBuildAndRunWorkspaceMigration',
        )
        .mockResolvedValue(undefined);

      const result = await service.updateOne({
        updatePageLayoutWidgetInput: updateInput,
        workspaceId,
      });

      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('deleteOne', () => {
    it('should soft delete a widget successfully', async () => {
      jest
        .spyOn(
          workspaceManyOrAllFlatEntityMapsCacheService,
          'getOrRecomputeManyOrAllFlatEntityMaps',
        )
        .mockResolvedValueOnce({
          flatPageLayoutWidgetMaps: mockFlatPageLayoutWidgetMaps,
        } as never)
        .mockResolvedValueOnce({
          flatPageLayoutWidgetMaps: {
            ...mockFlatPageLayoutWidgetMaps,
            byId: {
              'widget-id': {
                ...mockFlatPageLayoutWidgetMaps.byId['widget-id'],
                deletedAt: new Date(),
              },
            },
          },
        } as never);

      jest
        .spyOn(
          workspaceMigrationValidateBuildAndRunService,
          'validateBuildAndRunWorkspaceMigration',
        )
        .mockResolvedValue(undefined);

      const result = await service.deleteOne({
        deletePageLayoutWidgetInput: { id: 'widget-id' },
        workspaceId,
      });

      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('destroyOne', () => {
    it('should hard delete a widget successfully', async () => {
      jest
        .spyOn(
          workspaceManyOrAllFlatEntityMapsCacheService,
          'getOrRecomputeManyOrAllFlatEntityMaps',
        )
        .mockResolvedValue({
          flatPageLayoutWidgetMaps: mockFlatPageLayoutWidgetMaps,
        } as never);

      jest
        .spyOn(
          workspaceMigrationValidateBuildAndRunService,
          'validateBuildAndRunWorkspaceMigration',
        )
        .mockResolvedValue(undefined);

      const result = await service.destroyOne({
        destroyPageLayoutWidgetInput: { id: 'widget-id' },
        workspaceId,
      });

      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('restoreOne', () => {
    it('should restore a deleted widget successfully', async () => {
      const deletedWidget = { ...mockWidget, deletedAt: new Date() };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(deletedWidget);
      jest
        .spyOn(repository, 'restore')
        .mockResolvedValue({ affected: 1 } as never);
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockWidget);

      const result = await service.restoreOne({
        id: 'widget-id',
        workspaceId,
      });

      expect(repository.restore).toHaveBeenCalledWith('widget-id');
      expect(result).toEqual(mockWidget);
    });

    it('should throw exception when widget not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.restoreOne({
          id: 'non-existent-id',
          workspaceId,
        }),
      ).rejects.toThrow(PageLayoutWidgetException);
    });

    it('should throw exception when widget is not deleted', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockWidget);

      await expect(
        service.restoreOne({
          id: 'widget-id',
          workspaceId,
        }),
      ).rejects.toThrow(PageLayoutWidgetException);
    });
  });
});
