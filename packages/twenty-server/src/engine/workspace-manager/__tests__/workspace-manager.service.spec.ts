import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { SeederService } from 'src/engine/seeder/seeder.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';

describe('WorkspaceManagerService', () => {
  let service: WorkspaceManagerService;
  let objectMetadataService: ObjectMetadataService;
  let workspaceMigrationRepository: Repository<WorkspaceMigrationEntity>;
  let dataSourceRepository: Repository<DataSourceEntity>;
  let workspaceRelationMetadataRepository: Repository<RelationMetadataEntity>;
  let workspaceFieldMetadataRepository: Repository<FieldMetadataEntity>;
  let workspaceDataSourceService: WorkspaceDataSourceService;
  let userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>;
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
          provide: getRepositoryToken(FieldMetadataEntity, 'metadata'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RelationMetadataEntity, 'metadata'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'metadata'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceMigrationEntity, 'metadata'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DataSourceEntity, 'metadata'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserWorkspaceRoleEntity, 'metadata'),
          useValue: {
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity, 'metadata'),
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
          provide: SeederService,
          useValue: {},
        },
        {
          provide: ObjectMetadataService,
          useValue: {
            deleteObjectsMetadata: jest.fn(),
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
    >(getRepositoryToken(WorkspaceMigrationEntity, 'metadata'));
    dataSourceRepository = module.get<Repository<DataSourceEntity>>(
      getRepositoryToken(DataSourceEntity, 'metadata'),
    );
    workspaceRelationMetadataRepository = module.get<
      Repository<RelationMetadataEntity>
    >(getRepositoryToken(RelationMetadataEntity, 'metadata'));
    workspaceFieldMetadataRepository = module.get<
      Repository<FieldMetadataEntity>
    >(getRepositoryToken(FieldMetadataEntity, 'metadata'));
    workspaceDataSourceService = module.get<WorkspaceDataSourceService>(
      WorkspaceDataSourceService,
    );
    userWorkspaceRoleRepository = module.get<
      Repository<UserWorkspaceRoleEntity>
    >(getRepositoryToken(UserWorkspaceRoleEntity, 'metadata'));
    roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity, 'metadata'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete', () => {
    it('should delete all the workspace metadata tables and workspace schema', async () => {
      await service.delete('workspace-id');
      expect(objectMetadataService.deleteObjectsMetadata).toHaveBeenCalled();
      expect(workspaceRelationMetadataRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(workspaceFieldMetadataRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(workspaceMigrationRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(dataSourceRepository.delete).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
      });
      expect(userWorkspaceRoleRepository.delete).toHaveBeenCalledWith({
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
