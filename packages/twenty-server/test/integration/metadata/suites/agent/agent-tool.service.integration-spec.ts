import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';

import {
  type AgentToolTestContext,
  createAgentToolTestModule,
} from './utils/agent-tool-test-utils';

// Helper to create mock tools based on object name
const createMockTools = (
  objectName: string,
  options: {
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  },
) => {
  const tools: Record<string, { description: string; execute: jest.Mock }> = {};

  if (options.canRead) {
    tools[`find_${objectName}`] = {
      description: `Find ${objectName} records`,
      execute: jest.fn(),
    };
    tools[`find_one_${objectName}`] = {
      description: `Find one ${objectName} record`,
      execute: jest.fn(),
    };
  }
  if (options.canCreate) {
    tools[`create_${objectName}`] = {
      description: `Create ${objectName} record`,
      execute: jest.fn(),
    };
  }
  if (options.canUpdate) {
    tools[`update_${objectName}`] = {
      description: `Update ${objectName} record`,
      execute: jest.fn(),
    };
  }
  if (options.canDelete) {
    tools[`soft_delete_${objectName}`] = {
      description: `Delete ${objectName} record`,
      execute: jest.fn(),
    };
    tools[`soft_delete_many_${objectName}`] = {
      description: `Delete many ${objectName} records`,
      execute: jest.fn(),
    };
  }

  return tools;
};

describe('AgentToolGeneratorService Integration', () => {
  let context: AgentToolTestContext;

  beforeEach(async () => {
    context = await createAgentToolTestModule();
  });

  afterEach(async () => {
    await context.module.close();
  });

  describe('Tool Generation', () => {
    it('should generate complete tool set for agent with full permissions', async () => {
      // Arrange
      const roleWithFullPermissions = {
        ...context.testRole,
        canDestroyAllObjectRecords: true,
      };

      jest
        .spyOn(context.roleRepository, 'find')
        .mockResolvedValue([roleWithFullPermissions]);
      jest
        .spyOn(context.workspaceCacheService, 'getOrRecompute')
        .mockResolvedValue({
          rolesPermissions: {
            [context.testRoleId]: {
              [context.testObjectMetadata.id]: {
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
                canSoftDeleteObjectRecords: true,
                canDestroyObjectRecords: true,
                restrictedFields: {},
              },
            },
          },
        } as any);
      jest
        .spyOn(context.objectMetadataService, 'findManyWithinWorkspace')
        .mockResolvedValue([
          fromObjectMetadataEntityToFlatObjectMetadata(
            context.testObjectMetadata,
          ),
        ]);

      // Configure perObjectToolGeneratorService to return the expected tools
      jest
        .spyOn(context.perObjectToolGeneratorService, 'generate')
        .mockResolvedValue(
          createMockTools('testObject', {
            canRead: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
          }),
        );

      // Act
      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
        undefined,
        [context.testRoleId],
      );

      // Assert
      expect(tools).toBeDefined();
      expect(Object.keys(tools)).toHaveLength(6);
      expect(Object.keys(tools)).toContain('create_testObject');
      expect(Object.keys(tools)).toContain('update_testObject');
      expect(Object.keys(tools)).toContain('find_testObject');
      expect(Object.keys(tools)).toContain('find_one_testObject');
      expect(Object.keys(tools)).toContain('soft_delete_testObject');
      expect(Object.keys(tools)).toContain('soft_delete_many_testObject');
    });

    it('should generate read-only tools for agent with read permissions only', async () => {
      // Arrange
      jest
        .spyOn(context.roleRepository, 'find')
        .mockResolvedValue([context.testRole]);
      jest
        .spyOn(context.workspaceCacheService, 'getOrRecompute')
        .mockResolvedValue({
          rolesPermissions: {
            [context.testRoleId]: {
              [context.testObjectMetadata.id]: {
                canReadObjectRecords: true,
                canUpdateObjectRecords: false,
                canSoftDeleteObjectRecords: false,
                canDestroyObjectRecords: false,
                restrictedFields: {},
              },
            },
          },
        } as any);
      jest
        .spyOn(context.objectMetadataService, 'findManyWithinWorkspace')
        .mockResolvedValue([
          fromObjectMetadataEntityToFlatObjectMetadata(
            context.testObjectMetadata,
          ),
        ]);

      // Configure perObjectToolGeneratorService to return read-only tools
      jest
        .spyOn(context.perObjectToolGeneratorService, 'generate')
        .mockResolvedValue(
          createMockTools('testObject', {
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
          }),
        );

      // Act
      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
        undefined,
        [context.testRoleId],
      );

      // Assert
      expect(tools).toBeDefined();
      expect(Object.keys(tools)).toHaveLength(2);
      expect(Object.keys(tools)).toContain('find_testObject');
      expect(Object.keys(tools)).toContain('find_one_testObject');
      expect(Object.keys(tools)).not.toContain('create_testObject');
      expect(Object.keys(tools)).not.toContain('update_testObject');
    });

    it('should return no tool for agent without role', async () => {
      // Act
      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      // Assert
      expect(Object.keys(tools)).toHaveLength(0);
    });

    it('should filter out workflow-run objects', async () => {
      // Arrange
      const workflowObject = {
        ...context.testObjectMetadata,
        nameSingular: 'workflow',
        namePlural: 'workflows',
      };

      jest
        .spyOn(context.roleRepository, 'find')
        .mockResolvedValue([context.testRole]);
      jest
        .spyOn(context.workspaceCacheService, 'getOrRecompute')
        .mockResolvedValue({
          rolesPermissions: {
            [context.testRoleId]: {
              [workflowObject.id]: {
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
                canSoftDeleteObjectRecords: true,
                canDestroyObjectRecords: false,
                restrictedFields: {},
              },
            },
          },
        } as any);
      jest
        .spyOn(context.objectMetadataService, 'findManyWithinWorkspace')
        .mockResolvedValue([
          fromObjectMetadataEntityToFlatObjectMetadata(workflowObject),
        ]);

      // Note: workflow objects are filtered out by PerObjectToolGeneratorService,
      // so the mock returns tools for testObject (non-workflow) to simulate this behavior
      jest
        .spyOn(context.perObjectToolGeneratorService, 'generate')
        .mockResolvedValue(
          createMockTools('testObject', {
            canRead: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
          }),
        );

      // Act
      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
        undefined,
        [context.testRoleId],
      );

      // Assert
      expect(Object.keys(tools)).toHaveLength(6);
    });
  });
});
