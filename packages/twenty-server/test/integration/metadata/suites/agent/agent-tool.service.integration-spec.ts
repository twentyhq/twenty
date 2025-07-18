import {
  AgentToolTestContext,
  createAgentToolTestModule,
  createMockRepository,
  createTestRecord,
  createTestRecords,
  expectErrorResult,
  expectSuccessResult,
  setupBasicPermissions,
  setupRepositoryMock,
} from './utils/agent-tool-test-utils';

describe('AgentToolService Integration', () => {
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
        .spyOn(context.agentService, 'findOneAgent')
        .mockResolvedValue(context.testAgent as any);
      jest
        .spyOn(context.roleRepository, 'findOne')
        .mockResolvedValue(roleWithFullPermissions);
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
                canDestroy: true,
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
        .spyOn(context.agentService, 'findOneAgent')
        .mockResolvedValue(context.testAgent as any);
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
                canUpdate: false,
                canSoftDelete: false,
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

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      expect(tools).toBeDefined();
      expect(Object.keys(tools)).toHaveLength(3);
      expect(Object.keys(tools)).toContain('find_testObject');
      expect(Object.keys(tools)).toContain('find_one_testObject');
      expect(Object.keys(tools)).not.toContain('create_testObject');
      expect(Object.keys(tools)).not.toContain('update_testObject');
    });

    it('should return only http request tool for agent without role', async () => {
      const agentWithoutRole = { ...context.testAgent, roleId: null };

      jest
        .spyOn(context.agentService, 'findOneAgent')
        .mockResolvedValue(agentWithoutRole as any);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      expect(Object.keys(tools)).toHaveLength(1);
      expect(Object.keys(tools)).toContain('http_request');
    });

    it('should return empty tools when role does not exist', async () => {
      jest
        .spyOn(context.agentService, 'findOneAgent')
        .mockResolvedValue(context.testAgent as any);
      jest.spyOn(context.roleRepository, 'findOne').mockResolvedValue(null);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      expect(tools).toEqual({});
    });

    it('should filter out workflow-related objects', async () => {
      const workflowObject = {
        ...context.testObjectMetadata,
        nameSingular: 'workflow',
        namePlural: 'workflows',
      };

      jest
        .spyOn(context.agentService, 'findOneAgent')
        .mockResolvedValue(context.testAgent as any);
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
              [workflowObject.id]: {
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
        .mockResolvedValue([workflowObject]);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      expect(Object.keys(tools)).toHaveLength(1);
    });
  });

  describe('Create Record Operations', () => {
    it('should create a record successfully', async () => {
      const mockRepository = createMockRepository();
      const testRecord = createTestRecord('test-record-id', {
        name: 'Test Record',
        description: 'Test description',
      });

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.save.mockResolvedValue(testRecord);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const createTool = tools['create_testObject'];

      expect(createTool).toBeDefined();

      if (!createTool.execute) {
        throw new Error(
          'Create tool is missing or does not have an execute method',
        );
      }

      const result = await createTool.execute(
        { input: { name: 'Test Record', description: 'Test description' } },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Test Record',
            },
          ],
        },
      );

      expectSuccessResult(result, 'Successfully created testObject');
      expect(result.record).toEqual(testRecord);
      expect(mockRepository.save).toHaveBeenCalledWith({
        name: 'Test Record',
        description: 'Test description',
      });
    });

    it('should handle create record errors gracefully', async () => {
      const mockRepository = createMockRepository();

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.save.mockRejectedValue(
        new Error('Database constraint violation'),
      );

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const createTool = tools['create_testObject'];

      expect(createTool).toBeDefined();

      if (!createTool.execute) {
        throw new Error(
          'Create tool is missing or does not have an execute method',
        );
      }

      const result = await createTool.execute(
        { input: { name: 'Test Record' } },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Test Record',
            },
          ],
        },
      );

      expectErrorResult(
        result,
        'Database constraint violation',
        'Failed to create testObject',
      );
    });
  });

  describe('Find Record Operations', () => {
    it('should find records with basic parameters', async () => {
      const mockRepository = createMockRepository();
      const testRecords = createTestRecords(3);

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.find.mockResolvedValue(testRecords);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const findTool = tools['find_testObject'];

      expect(findTool).toBeDefined();

      if (!findTool.execute) {
        throw new Error(
          'Find tool is missing or does not have an execute method',
        );
      }

      const result = await findTool.execute(
        { input: { limit: 10, offset: 0 } },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Find records',
            },
          ],
        },
      );

      expectSuccessResult(result, 'Found 3 testObject records');
      expect(result.records).toEqual(testRecords);
      expect(result.count).toBe(3);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });

    it('should find one record by ID', async () => {
      const mockRepository = createMockRepository();
      const testRecord = createTestRecord('test-record-id', {
        name: 'Test Record',
      });

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.findOne.mockResolvedValue(testRecord);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const findOneTool = tools['find_one_testObject'];

      expect(findOneTool).toBeDefined();

      if (!findOneTool.execute) {
        throw new Error(
          'Find one tool is missing or does not have an execute method',
        );
      }

      const result = await findOneTool.execute(
        { input: { id: 'test-record-id' } },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Find one record',
            },
          ],
        },
      );

      expectSuccessResult(result, 'Found testObject record');
      expect(result.record).toEqual(testRecord);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-record-id' },
      });
    });

    it('should handle find one record not found', async () => {
      const mockRepository = createMockRepository();

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.findOne.mockResolvedValue(null);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const findOneTool = tools['find_one_testObject'];

      expect(findOneTool).toBeDefined();

      if (!findOneTool.execute) {
        throw new Error(
          'Find one tool is missing or does not have an execute method',
        );
      }

      const result = await findOneTool.execute(
        { input: { id: 'non-existent-id' } },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Find one record',
            },
          ],
        },
      );

      expectErrorResult(
        result,
        'Record not found',
        'Failed to find testObject: Record with ID non-existent-id not found',
      );
    });

    it('should handle find one record without ID', async () => {
      setupBasicPermissions(context);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const findOneTool = tools['find_one_testObject'];

      expect(findOneTool).toBeDefined();

      if (!findOneTool.execute) {
        throw new Error(
          'Find one tool is missing or does not have an execute method',
        );
      }

      const result = await findOneTool.execute(
        { input: {} },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Find one record',
            },
          ],
        },
      );

      expectErrorResult(
        result,
        'Record ID is required',
        'Failed to find testObject: Record ID is required',
      );
    });
  });

  describe('Update Record Operations', () => {
    it('should update a record successfully', async () => {
      const mockRepository = createMockRepository();
      const existingRecord = createTestRecord('test-record-id', {
        name: 'Old Name',
        description: 'Old description',
      });
      const updatedRecord = createTestRecord('test-record-id', {
        name: 'New Name',
        description: 'New description',
      });

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      jest
        .spyOn(context.objectMetadataService, 'findOneWithinWorkspace')
        .mockResolvedValue(context.testObjectMetadata);
      mockRepository.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(updatedRecord);
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const updateTool = tools['update_testObject'];

      expect(updateTool).toBeDefined();

      if (!updateTool.execute) {
        throw new Error(
          'Update tool is missing or does not have an execute method',
        );
      }

      const result = await updateTool.execute(
        {
          input: {
            id: 'test-record-id',
            name: 'New Name',
            description: 'New description',
          },
        },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Update record',
            },
          ],
        },
      );

      expectSuccessResult(result, 'Successfully updated testObject');
      expect(result.record).toEqual(updatedRecord);
      expect(mockRepository.update).toHaveBeenCalledWith('test-record-id', {
        name: 'New Name',
        description: 'New description',
      });
    });

    it('should handle update record not found', async () => {
      const mockRepository = createMockRepository();

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.findOne.mockResolvedValue(null);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const updateTool = tools['update_testObject'];

      expect(updateTool).toBeDefined();

      if (!updateTool.execute) {
        throw new Error(
          'Update tool is missing or does not have an execute method',
        );
      }

      const result = await updateTool.execute(
        {
          input: {
            id: 'non-existent-id',
            name: 'New Name',
          },
        },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Update record',
            },
          ],
        },
      );

      expectErrorResult(
        result,
        'Record not found',
        'Failed to update testObject: Record with ID non-existent-id not found',
      );
    });
  });

  describe('Soft Delete Operations', () => {
    it('should soft delete a single record', async () => {
      const mockRepository = createMockRepository();
      const existingRecord = createTestRecord('test-record-id', {
        name: 'Test Record',
      });

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.findOne.mockResolvedValue(existingRecord);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const softDeleteTool = tools['soft_delete_testObject'];

      expect(softDeleteTool).toBeDefined();

      if (!softDeleteTool.execute) {
        throw new Error(
          'Soft delete tool is missing or does not have an execute method',
        );
      }

      const result = await softDeleteTool.execute(
        { input: { id: 'test-record-id' } },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Soft delete record',
            },
          ],
        },
      );

      expectSuccessResult(result, 'Successfully soft deleted testObject');
      expect(mockRepository.softDelete).toHaveBeenCalledWith('test-record-id');
    });

    it('should soft delete multiple records', async () => {
      const mockRepository = createMockRepository();
      const existingRecords = createTestRecords(3);

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.find.mockResolvedValue(existingRecords);
      mockRepository.softDelete.mockResolvedValue({ affected: 3 } as any);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const softDeleteManyTool = tools['soft_delete_many_testObject'];

      expect(softDeleteManyTool).toBeDefined();

      if (!softDeleteManyTool.execute) {
        throw new Error(
          'Soft delete many tool is missing or does not have an execute method',
        );
      }

      const result = await softDeleteManyTool.execute(
        {
          input: {
            filter: { id: { in: ['record-1', 'record-2', 'record-3'] } },
          },
        },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Soft delete many records',
            },
          ],
        },
      );

      expectSuccessResult(
        result,
        'Successfully soft deleted 3 testObject records',
      );
      expect(mockRepository.softDelete).toHaveBeenCalledWith({
        id: expect.any(Object),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search criteria in find records', async () => {
      const mockRepository = createMockRepository();
      const testRecords = createTestRecords(2);

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.find.mockResolvedValue(testRecords);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const findTool = tools['find_testObject'];

      expect(findTool).toBeDefined();

      if (!findTool.execute) {
        throw new Error(
          'Find tool is missing or does not have an execute method',
        );
      }

      const result = await findTool.execute(
        { input: {} },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Find records',
            },
          ],
        },
      );

      expectSuccessResult(result, 'Found 2 testObject records');
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        take: 100,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });

    it('should handle null and undefined values in search criteria', async () => {
      const mockRepository = createMockRepository();
      const testRecords = createTestRecords(1);

      setupBasicPermissions(context);
      setupRepositoryMock(context, mockRepository);
      mockRepository.find.mockResolvedValue(testRecords);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );
      const findTool = tools['find_testObject'];

      expect(findTool).toBeDefined();

      if (!findTool.execute) {
        throw new Error(
          'Find tool is missing or does not have an execute method',
        );
      }

      const result = await findTool.execute(
        {
          input: {
            name: null,
            description: undefined,
            status: '',
            validField: 'valid value',
          },
        },
        {
          toolCallId: 'test-tool-call-id',
          messages: [
            {
              role: 'user',
              content: 'Find records',
            },
          ],
        },
      );

      expectSuccessResult(result, 'Found 1 testObject records');
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { validField: 'valid value' },
        take: 100,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });

    it('should handle multiple object metadata with different permissions', async () => {
      const secondObjectMetadata = {
        ...context.testObjectMetadata,
        id: 'second-object-id',
        nameSingular: 'secondObject',
        namePlural: 'secondObjects',
        labelSingular: 'Second Object',
        labelPlural: 'Second Objects',
      };

      jest
        .spyOn(context.agentService, 'findOneAgent')
        .mockResolvedValue(context.testAgent as any);
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
                canSoftDelete: false,
                canDestroy: false,
                restrictedFields: {},
              },
              [secondObjectMetadata.id]: {
                canRead: true,
                canUpdate: false,
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
        .mockResolvedValue([context.testObjectMetadata, secondObjectMetadata]);

      const tools = await context.agentToolService.generateToolsForAgent(
        context.testAgentId,
        context.testWorkspaceId,
      );

      expect(tools).toBeDefined();
      expect(Object.keys(tools)).toHaveLength(9);
      expect(Object.keys(tools)).toContain('create_testObject');
      expect(Object.keys(tools)).toContain('update_testObject');
      expect(Object.keys(tools)).toContain('find_testObject');
      expect(Object.keys(tools)).toContain('find_one_testObject');
      expect(Object.keys(tools)).toContain('soft_delete_secondObject');
      expect(Object.keys(tools)).toContain('soft_delete_many_secondObject');
      expect(Object.keys(tools)).not.toContain('soft_delete_testObject');
      expect(Object.keys(tools)).not.toContain('create_secondObject');
    });
  });
});
