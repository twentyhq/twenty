import {
  type AgentToolTestContext,
  createAgentToolTestModule,
} from './utils/agent-tool-test-utils';

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
      const roleWithFullPermissions = {
        ...context.testRole,
        canDestroyAllObjectRecords: true,
      };

      jest
        .spyOn(context.roleRepository, 'find')
        .mockResolvedValue([roleWithFullPermissions]);
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
                canDestroyObjectRecords: true,
                restrictedFields: {},
              },
            },
          },
          version: '1.0',
        });
      jest
        .spyOn(context.objectMetadataService, 'findManyWithinWorkspace')
        .mockResolvedValue([context.testObjectMetadata]);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
        undefined,
        [context.testRoleId],
      );

      expect(tools).toBeDefined();
      expect(Object.keys(tools)).toHaveLength(7);
      expect(Object.keys(tools)).toContain('create_testObject');
      expect(Object.keys(tools)).toContain('update_testObject');
      expect(Object.keys(tools)).toContain('find_testObject');
      expect(Object.keys(tools)).toContain('find_one_testObject');
      expect(Object.keys(tools)).toContain('soft_delete_testObject');
      expect(Object.keys(tools)).toContain('soft_delete_many_testObject');
      expect(Object.keys(tools)).toContain('http_request');
    });

    it('should generate read-only tools for agent with read permissions only', async () => {
      jest
        .spyOn(context.roleRepository, 'find')
        .mockResolvedValue([context.testRole]);
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
                canUpdateObjectRecords: false,
                canSoftDeleteObjectRecords: false,
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

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
        undefined,
        [context.testRoleId],
      );

      expect(tools).toBeDefined();
      expect(Object.keys(tools)).toHaveLength(3);
      expect(Object.keys(tools)).toContain('find_testObject');
      expect(Object.keys(tools)).toContain('find_one_testObject');
      expect(Object.keys(tools)).toContain('http_request');
      expect(Object.keys(tools)).not.toContain('create_testObject');
      expect(Object.keys(tools)).not.toContain('update_testObject');
    });

    it('should return only http request tool for agent without role', async () => {
      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      expect(Object.keys(tools)).toHaveLength(1);
      expect(Object.keys(tools)).toContain('http_request');
    });

    it('should filter out workflow-run objects', async () => {
      const workflowObject = {
        ...context.testObjectMetadata,
        nameSingular: 'workflow',
        namePlural: 'workflows',
      };

      jest
        .spyOn(context.roleRepository, 'find')
        .mockResolvedValue([context.testRole]);
      jest
        .spyOn(
          context.workspacePermissionsCacheService,
          'getRolesPermissionsFromCache',
        )
        .mockResolvedValue({
          data: {
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
          version: '1.0',
        });
      jest
        .spyOn(context.objectMetadataService, 'findManyWithinWorkspace')
        .mockResolvedValue([workflowObject]);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
        undefined,
        [context.testRoleId],
      );

      expect(Object.keys(tools)).toHaveLength(7);
    });
  });
});
