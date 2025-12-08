import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ToolProviderService } from 'src/engine/core-modules/tool-provider/services/tool-provider.service';
import { AgentToolGeneratorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-tool-generator.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getMockObjectMetadataEntity } from 'src/utils/__test__/get-object-metadata-entity.mock';

export interface AgentToolTestContext {
  module: TestingModule;
  agentToolService: AgentToolGeneratorService;
  agentService: AgentService;
  objectMetadataService: ObjectMetadataService;
  roleRepository: Repository<RoleEntity>;
  workspaceCacheService: WorkspaceCacheService;
  toolProviderService: ToolProviderService;
  twentyORMGlobalManager: TwentyORMGlobalManager;
  testAgent: AgentEntity & { roleId: string | null };
  testRole: RoleEntity;
  testObjectMetadata: ObjectMetadataEntity;
  testWorkspaceId: string;
  testAgentId: string;
  testRoleId: string;
}

export const createAgentToolTestModule =
  async (): Promise<AgentToolTestContext> => {
    const testWorkspaceId = 'test-workspace-id';
    const testAgentId = 'test-agent-id';
    const testRoleId = 'test-role-id';

    const module = await Test.createTestingModule({
      providers: [
        AgentToolGeneratorService,
        {
          provide: AgentService,
          useValue: {
            findOneAgent: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AgentEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: ObjectMetadataService,
          useValue: {
            findManyWithinWorkspace: jest.fn(),
            findOneWithinWorkspace: jest.fn(),
          },
        },
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest.fn(),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn(),
          },
        },
        {
          provide: ToolProviderService,
          useValue: {
            getTools: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            hasToolPermission: jest.fn(),
            checkRolePermissions: jest.fn().mockReturnValue(true),
            checkRolesPermissions: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    const agentToolService = module.get<AgentToolGeneratorService>(
      AgentToolGeneratorService,
    );
    const agentService = module.get<AgentService>(AgentService);
    const objectMetadataService = module.get<ObjectMetadataService>(
      ObjectMetadataService,
    );
    const roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity),
    );
    const twentyORMGlobalManager = module.get<TwentyORMGlobalManager>(
      TwentyORMGlobalManager,
    );

    const testAgent: AgentEntity & { roleId: string | null } = {
      id: testAgentId,
      name: 'test-agent',
      label: 'Test Agent',
      icon: 'IconTest',
      isCustom: false,
      applicationId: null,
      application: {} as ApplicationEntity,
      standardId: null,
      deletedAt: null,
      universalIdentifier: testAgentId,
      description: 'Test agent for integration tests',
      prompt: 'You are a test agent',
      modelId: 'gpt-4o',
      evaluationInputs: [],
      responseFormat: { type: 'text' },
      workspaceId: testWorkspaceId,
      workspace: {} as any,
      roleId: testRoleId,
      createdAt: new Date(),
      updatedAt: new Date(),
      modelConfiguration: {},
    };

    const testRole: RoleEntity = {
      id: testRoleId,
      label: 'Test Role',
      description: 'Test role for integration tests',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: false,
      workspaceId: testWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEditable: true,
    } as RoleEntity;

    const testObjectMetadata = getMockObjectMetadataEntity({
      id: 'test-object-id',
      standardId: null,
      dataSourceId: 'test-data-source-id',
      nameSingular: 'testObject',
      namePlural: 'testObjects',
      labelSingular: 'Test Object',
      labelPlural: 'Test Objects',
      description: 'Test object for integration tests',
      icon: 'IconTest',
      targetTableName: 'test_objects',
      isActive: true,
      isSystem: false,
      isCustom: false,
      isRemote: false,
      isAuditLogged: true,
      isSearchable: false,
      shortcut: '',
      isLabelSyncedWithName: false,
      workspaceId: testWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: [],
      indexMetadatas: [],
      targetRelationFields: [],
      dataSource: {} as any,
      objectPermissions: [],
      fieldPermissions: [],
    });

    const workspaceCacheService = module.get<WorkspaceCacheService>(
      WorkspaceCacheService,
    );

    const toolProviderService =
      module.get<ToolProviderService>(ToolProviderService);

    return {
      module,
      agentToolService,
      agentService,
      objectMetadataService,
      roleRepository,
      workspaceCacheService,
      toolProviderService,
      twentyORMGlobalManager,
      testAgent,
      testRole,
      testObjectMetadata,
      testWorkspaceId,
      testAgentId,
      testRoleId,
    };
  };
