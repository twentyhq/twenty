import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceManagerService,
        WorkspaceMigrationService,
        DataSourceService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity, 'core'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'core'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceMigrationEntity, 'core'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DataSourceEntity, 'core'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleTargetsEntity, 'core'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity, 'core'),
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
      ],
    }).compile();

    service = module.get<WorkspaceManagerService>(WorkspaceManagerService);
    objectMetadataService = module.get<ObjectMetadataService>(
      ObjectMetadataService,
    );
    workspaceMigrationRepository = module.get<
      Repository<WorkspaceMigrationEntity>
    >(getRepositoryToken(WorkspaceMigrationEntity, 'core'));
    dataSourceRepository = module.get<Repository<DataSourceEntity>>(
      getRepositoryToken(DataSourceEntity, 'core'),
    );
    workspaceFieldMetadataRepository = module.get<
      Repository<FieldMetadataEntity>
    >(getRepositoryToken(FieldMetadataEntity, 'core'));
    workspaceDataSourceService = module.get<WorkspaceDataSourceService>(
      WorkspaceDataSourceService,
    );
    roleTargetsRepository = module.get<Repository<RoleTargetsEntity>>(
      getRepositoryToken(RoleTargetsEntity, 'core'),
    );
    roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity, 'core'),
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
