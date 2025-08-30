import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { type DataSource, type Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

describe('WorkspaceManagerService', () => {
  let service: WorkspaceManagerService;
  let objectMetadataService: ObjectMetadataService;
  let workspaceMigrationRepository: Repository<WorkspaceMigrationEntity>;
  let dataSourceRepository: Repository<DataSourceEntity>;
  let workspaceFieldMetadataRepository: Repository<FieldMetadataEntity>;
  let workspaceDataSourceService: WorkspaceDataSourceService;
  let roleTargetsRepository: Repository<RoleTargetsEntity>;
  let roleRepository: Repository<RoleEntity>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    mockDataSource = {
      transaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceManagerService,
        WorkspaceMigrationService,
        DataSourceService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
        {
          provide: getRepositoryToken(Workspace),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspace),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceMigrationEntity),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DataSourceEntity),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleTargetsEntity),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {},
        },
        {
          provide: FeatureFlagService,
          useValue: {},
        },
        {
          provide: RoleService,
          useValue: {},
        },
        {
          provide: UserRoleService,
          useValue: {},
        },
        {
          provide: WorkspaceDataSourceService,
          useValue: {
            deleteWorkspaceDBSchema: jest.fn(),
          },
        },
        {
          provide: WorkspaceSyncMetadataService,
          useValue: {},
        },

        {
          provide: ObjectMetadataService,
          useValue: {
            deleteObjectsMetadata: jest.fn(),
          },
        },
        {
          provide: AgentService,
          useValue: {
            createOneAgent: jest
              .fn()
              .mockResolvedValue({ id: 'mock-agent-id' }),
          },
        },
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getDataSourceForWorkspace: jest.fn().mockResolvedValue({
              transaction: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceManagerService>(WorkspaceManagerService);
    objectMetadataService = module.get<ObjectMetadataService>(
      ObjectMetadataService,
    );
    workspaceMigrationRepository = module.get<
      Repository<WorkspaceMigrationEntity>
    >(getRepositoryToken(WorkspaceMigrationEntity));
    dataSourceRepository = module.get<Repository<DataSourceEntity>>(
      getRepositoryToken(DataSourceEntity),
    );
    workspaceFieldMetadataRepository = module.get<
      Repository<FieldMetadataEntity>
    >(getRepositoryToken(FieldMetadataEntity));
    workspaceDataSourceService = module.get<WorkspaceDataSourceService>(
      WorkspaceDataSourceService,
    );
    roleTargetsRepository = module.get<Repository<RoleTargetsEntity>>(
      getRepositoryToken(RoleTargetsEntity),
    );
    roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete', () => {
    it('should delete all the workspace metadata tables and workspace schema', async () => {
      await service.delete('workspace-id');
      expect(objectMetadataService.deleteObjectsMetadata).toHaveBeenCalled();
      expect(workspaceFieldMetadataRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(workspaceMigrationRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(dataSourceRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(roleTargetsRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(roleRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(
        workspaceDataSourceService.deleteWorkspaceDBSchema,
      ).toHaveBeenCalled();
    });
  });
});
