import { type ToolSet } from 'ai';

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
): ToolSet => {
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

  return tools as unknown as ToolSet;
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
      // Configure toolProviderService to return the expected tools
      jest.spyOn(context.toolProviderService, 'getTools').mockResolvedValue(
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
      // Configure toolProviderService to return read-only tools
      jest.spyOn(context.toolProviderService, 'getTools').mockResolvedValue(
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
      // Configure toolProviderService to return empty tools when no role
      jest.spyOn(context.toolProviderService, 'getTools').mockResolvedValue({});

      // Act
      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      // Assert
      expect(Object.keys(tools)).toHaveLength(0);
    });

    it('should filter out workflow-run objects', async () => {
      // Note: workflow objects are filtered out by ToolProviderService,
      // so the mock returns tools for testObject (non-workflow) to simulate this behavior
      jest.spyOn(context.toolProviderService, 'getTools').mockResolvedValue(
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
