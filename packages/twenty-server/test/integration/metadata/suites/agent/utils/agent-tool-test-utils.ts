import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { AgentHandoffExecutorService } from 'src/engine/metadata-modules/agent/agent-handoff-executor.service';
import { AgentHandoffService } from 'src/engine/metadata-modules/agent/agent-handoff.service';
import { AgentToolService } from 'src/engine/metadata-modules/agent/agent-tool.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessagingSendMessageService } from 'src/modules/messaging/message-import-manager/services/messaging-send-message.service';
import { getMockObjectMetadataEntity } from 'src/utils/__test__/get-object-metadata-entity.mock';

export interface AgentToolTestContext {
  module: TestingModule;
  agentToolService: AgentToolService;
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
        AgentToolService,
        {
          provide: AgentService,
          useValue: {
            findOneAgent: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity, 'core'),
          useValue: {
            findOne: jest.fn(),
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
            parameters: {},
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
      ],
    }).compile();

    const agentToolService = module.get<AgentToolService>(AgentToolService);
    const agentService = module.get<AgentService>(AgentService);
    const objectMetadataService = module.get<ObjectMetadataService>(
      ObjectMetadataService,
    );
    const roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity, 'core'),
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
      description: 'Test agent for integration tests',
      prompt: 'You are a test agent',
      modelId: 'gpt-4o',
      responseFormat: {},
      workspaceId: testWorkspaceId,
      workspace: {} as any,
      roleId: testRoleId,
      createdAt: new Date(),
      updatedAt: new Date(),
      chatThreads: [],
      incomingHandoffs: [],
      outgoingHandoffs: [],
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
            canRead: true,
            canUpdate: true,
            canSoftDelete: true,
            canDestroy: false,
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
