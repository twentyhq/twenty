import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';

import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';

describe('Agent creation should succeed', () => {
  let createdAgentId: string;

  afterEach(async () => {
    if (createdAgentId) {
      await deleteOneAgent({
        expectToFail: false,
        input: { id: createdAgentId },
      });
    }
  });

  it('should create a basic custom agent with minimal input', async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Test Agent',
        prompt: 'You are a helpful test assistant',
        modelId: 'gpt-4o',
      },
    });

    createdAgentId = data?.createOneAgent?.id;

    expect(data.createOneAgent).toMatchObject({
      id: expect.any(String),
      name: 'testAgent',
      label: 'Test Agent',
      icon: null,
      description: null,
      prompt: 'You are a helpful test assistant',
      modelId: 'gpt-4o',
      responseFormat: { type: 'text' },
      roleId: null,
      isCustom: true,
      modelConfiguration: null,
      evaluationInputs: [],
    });
  });

  it('should create agent with all optional fields', async () => {
    const input = {
      name: 'customAgentName',
      label: 'Custom Agent Label',
      icon: 'IconRobot',
      description: 'A custom agent with all fields specified',
      prompt: 'You are a specialized assistant for testing',
      modelId: 'gpt-4o-mini',
      responseFormat: { type: 'text' },
      modelConfiguration: {
        webSearch: {
          enabled: true,
          configuration: {
            maxTokens: 1000,
            temperature: 0.7,
          },
        },
        twitterSearch: {
          enabled: true,
          configuration: {},
        },
      },
      evaluationInputs: ['test input 1', 'test input 2'],
    } as const satisfies CreateAgentInput;
    const { data } = await createOneAgent({
      expectToFail: false,
      input,
    });

    createdAgentId = data?.createOneAgent?.id;

    expect(data.createOneAgent).toMatchObject({
      id: expect.any(String),
      ...input,
    });
  });

  it('should create agent with JSON response format', async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'JSON Response Agent',
        prompt: 'Return structured JSON data',
        modelId: 'gpt-4o',
        responseFormat: {
          type: 'json',
          schema: {
            type: 'object',
            properties: {
              result: { type: 'string' },
              confidence: { type: 'number' },
            },
          },
        },
      },
    });

    createdAgentId = data?.createOneAgent?.id;

    expect(data.createOneAgent).toMatchObject({
      id: expect.any(String),
      label: 'JSON Response Agent',
      prompt: 'Return structured JSON data',
      responseFormat: {
        type: 'json',
        schema: {
          type: 'object',
          properties: {
            result: { type: 'string' },
            confidence: { type: 'number' },
          },
        },
      },
    });
  });

  it('should create agent and automatically compute name from label', async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'My Test Agent With Spaces',
        prompt: 'Testing name computation',
        modelId: 'gpt-4o',
      },
    });

    createdAgentId = data?.createOneAgent?.id;

    expect(data.createOneAgent).toMatchObject({
      id: expect.any(String),
      name: 'myTestAgentWithSpaces',
      label: 'My Test Agent With Spaces',
    });
  });

  it('should sanitize input by trimming whitespace', async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        name: '  agentWithSpaces  ',
        label: '  Agent With Spaces  ',
        icon: '  IconRobot  ',
        description: '  Description with spaces  ',
        prompt: '  Prompt with spaces  ',
        modelId: 'gpt-4o',
      },
    });

    createdAgentId = data?.createOneAgent?.id;

    expect(data.createOneAgent).toMatchObject({
      id: expect.any(String),
      name: 'agentWithSpaces',
      label: 'Agent With Spaces',
      icon: 'IconRobot',
      description: 'Description with spaces',
      prompt: 'Prompt with spaces',
    });
  });

  it('should create agent with role assignment', async () => {
    // First, create a role that can be assigned to agents
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Agent Role',
        description: 'A role for agent testing',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    const createdRoleId = roleData?.createOneRole?.id;

    // Create agent with role assignment
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Agent With Role',
        prompt: 'Agent with role assignment',
        modelId: 'gpt-4o',
        roleId: createdRoleId,
      },
    });

    createdAgentId = data?.createOneAgent?.id;

    expect(data.createOneAgent).toMatchObject({
      id: expect.any(String),
      label: 'Agent With Role',
      prompt: 'Agent with role assignment',
      modelId: 'gpt-4o',
      roleId: createdRoleId,
      isCustom: true,
    });

    // Clean up the role
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: createdRoleId },
    });
  });
});
