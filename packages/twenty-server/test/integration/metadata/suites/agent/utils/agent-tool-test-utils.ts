import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { SearchArticlesTool } from 'src/engine/core-modules/tool/tools/search-articles-tool/search-articles-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AgentHandoffExecutorService } from 'src/engine/metadata-modules/agent/agent-handoff-executor.service';
import { AgentHandoffService } from 'src/engine/metadata-modules/agent/agent-handoff.service';
import { AgentToolGeneratorService } from 'src/engine/metadata-modules/agent/agent-tool-generator.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';
import { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';
import { getMockObjectMetadataEntity } from 'src/utils/__test__/get-object-metadata-entity.mock';

export interface AgentToolTestContext {
  module: TestingModule;
  agentToolService: AgentToolGeneratorService;
  agentService: AgentService;
  objectMetadataService: ObjectMetadataService;
  roleRepository: Repository<RoleEntity>;
  workspacePermissionsCacheService: WorkspacePermissionsCacheService;
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
          provide: WorkspacePermissionsCacheService,
          useValue: {
            getRolesPermissionsFromCache: jest.fn(),
          },
        },
        {
          provide: ToolService,
          useClass: ToolService,
        },
        {
          provide: CreateRecordService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateRecordService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteRecordService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: FindRecordsService,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              success: true,
              message: 'Records found successfully',
              result: [],
            }),
          },
        },
        {
          provide: RecordInputTransformerService,
          useValue: {
            process: jest.fn(async ({ recordInput }) => recordInput),
          },
        },
        {
          provide: WorkspaceCacheStorageService,
          useValue: {
            getObjectMetadataMapsOrThrow: jest.fn(),
          },
        },
        {
          provide: ToolAdapterService,
          useClass: ToolAdapterService,
        },
        {
          provide: ToolRegistryService,
          useClass: ToolRegistryService,
        },
        {
          provide: SendEmailTool,
          useValue: {
            description: 'mock',
            inputSchema: {},
            execute: jest.fn(),
          },
        },
        {
          provide: SearchArticlesTool,
          useValue: {
            description: 'Search for articles and documentation',
            inputSchema: {},
            execute: jest.fn(),
          },
        },
        {
          provide: ScopedWorkspaceContextFactory,
          useValue: {
            create: jest.fn(() => ({ workspaceId: 'test-workspace-id' })),
          },
        },
        {
          provide: MessagingSendMessageService,
          useValue: { sendMessage: jest.fn() },
        },
        {
          provide: PermissionsService,
          useValue: {
            hasToolPermission: jest.fn(),
            checkRolePermissions: jest.fn().mockReturnValue(true),
            checkRolesPermissions: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AgentHandoffService,
          useValue: {
            getHandoffTargets: jest.fn().mockResolvedValue([]),
            canHandoffTo: jest.fn().mockResolvedValue(true),
            getAgentHandoffs: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: AgentHandoffExecutorService,
          useValue: {
            executeHandoff: jest.fn().mockResolvedValue({ success: true }),
          },
        },
        {
          provide: WorkflowToolWorkspaceService,
          useValue: {
            generateWorkflowTools: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
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
    const workspacePermissionsCacheService =
      module.get<WorkspacePermissionsCacheService>(
        WorkspacePermissionsCacheService,
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
      responseFormat: {},
      workspaceId: testWorkspaceId,
      workspace: {} as any,
      roleId: testRoleId,
      createdAt: new Date(),
      updatedAt: new Date(),
      incomingHandoffs: [],
      outgoingHandoffs: [],
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

    // Ensure ToolService input transformation has access to minimal metadata maps
    const workspaceCacheStorageService =
      module.get<WorkspaceCacheStorageService>(WorkspaceCacheStorageService);

    // Return a barebones object metadata map where fields are unknown (so transformer is a no-op)
    const getMapsMock =
      workspaceCacheStorageService.getObjectMetadataMapsOrThrow as jest.Mock;

    getMapsMock.mockResolvedValue({
      byId: {
        [testObjectMetadata.id]: {
          ...testObjectMetadata,
          fieldsById: {},
          fieldIdByJoinColumnName: {},
          fieldIdByName: {},
          indexMetadatas: [],
        },
      },
      idByNameSingular: {
        [testObjectMetadata.nameSingular]: testObjectMetadata.id,
      },
    });

    return {
      module,
      agentToolService,
      agentService,
      objectMetadataService,
      roleRepository,
      workspacePermissionsCacheService,
      twentyORMGlobalManager,
      testAgent,
      testRole,
      testObjectMetadata,
      testWorkspaceId,
      testAgentId,
      testRoleId,
    };
  };

export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
});

export const setupBasicPermissions = (context: AgentToolTestContext) => {
  jest
    .spyOn(context.agentService, 'findOneAgent')
    .mockResolvedValue(context.testAgent);
  jest
    .spyOn(context.roleRepository, 'findOne')
    .mockResolvedValue(context.testRole);
  jest
    .spyOn(
      context.workspacePermissionsCacheService,
      'getRolesPermissionsFromCache',
    )
    .mockResolvedValue({
      data: {
        [context.testRoleId]: {
          [context.testObjectMetadata.id]: {
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: false,
            restrictedFields: {},
          },
        },
      },
      version: '1.0',
    });
  jest
    .spyOn(context.objectMetadataService, 'findManyWithinWorkspace')
    .mockResolvedValue([context.testObjectMetadata]);
};

export const setupRepositoryMock = (
  context: AgentToolTestContext,
  mockRepository: any,
) => {
  jest
    .spyOn(context.twentyORMGlobalManager, 'getRepositoryForWorkspace')
    .mockResolvedValue(mockRepository);
};

export const createTestRecord = (
  id: string,
  data: Record<string, any> = {},
) => ({
  id,
  name: `Test Record ${id}`,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...data,
});

export const createTestRecords = (
  count: number,
  baseData: Record<string, any> = {},
) => {
  return Array.from({ length: count }, (_, i) =>
    createTestRecord(`record-${i + 1}`, baseData),
  );
};

export const expectSuccessResult = (result: any, expectedMessage?: string) => {
  expect(result.success).toBe(true);
  if (expectedMessage) {
    expect(result.message).toContain(expectedMessage);
  }
};

export const expectErrorResult = (
  result: any,
  expectedError?: string,
  expectedMessage?: string,
) => {
  expect(result.success).toBe(false);
  if (expectedError) {
    expect(result.error).toBe(expectedError);
  }
  if (expectedMessage) {
    expect(result.message).toContain(expectedMessage);
  }
};
