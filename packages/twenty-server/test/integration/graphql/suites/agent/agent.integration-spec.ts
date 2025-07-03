import gql from 'graphql-tag';
import { AGENT_GQL_FIELDS } from 'test/integration/constants/agent-gql-fields.constants';
import { createAgentOperation } from 'test/integration/graphql/utils/create-agent-operation-factory.util';
import { deleteAgentOperation } from 'test/integration/graphql/utils/delete-agent-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateAgentOperation } from 'test/integration/graphql/utils/update-agent-operation-factory.util';

describe('agentResolver', () => {
  describe('createOneAgent', () => {
    it('should create an agent successfully', async () => {
      const operation = createAgentOperation({
        name: 'Test AI Agent Admin',
        description: 'A test AI agent created by admin',
        prompt: 'You are a helpful AI assistant for testing.',
        modelId: 'gpt-4o',
        responseFormat: { type: 'json_object' },
      });
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.createOneAgent).toBeDefined();
      expect(response.body.data.createOneAgent.id).toBeDefined();
      expect(response.body.data.createOneAgent.name).toBe(
        'Test AI Agent Admin',
      );
      expect(response.body.data.createOneAgent.description).toBe(
        'A test AI agent created by admin',
      );
      expect(response.body.data.createOneAgent.prompt).toBe(
        'You are a helpful AI assistant for testing.',
      );
      expect(response.body.data.createOneAgent.modelId).toBe('gpt-4o');
      expect(response.body.data.createOneAgent.responseFormat).toEqual({
        type: 'json_object',
      });
      await makeGraphqlAPIRequest(
        deleteAgentOperation(response.body.data.createOneAgent.id),
      );
    });

    it('should validate required fields and return error', async () => {
      const operation = createAgentOperation({
        name: undefined as any,
        description: 'Agent without required fields',
        prompt: undefined as any,
        modelId: undefined as any,
      });
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain(
        'Field "name" of required type "String!" was not provided',
      );
    });
  });

  describe('findOneAgent', () => {
    let testAgentId: string;

    beforeAll(async () => {
      const operation = createAgentOperation({
        name: 'Test Agent for Find',
        description: 'A test agent for find operations',
        prompt: 'You are a test agent for finding.',
        modelId: 'gpt-4o',
      });
      const response = await makeGraphqlAPIRequest(operation);

      testAgentId = response.body.data.createOneAgent.id;
    });
    afterAll(async () => {
      await makeGraphqlAPIRequest(deleteAgentOperation(testAgentId));
    });
    it('should find agent by ID successfully', async () => {
      const queryData = {
        query: gql`
          query FindOneAgent($input: AgentIdInput!) {
            findOneAgent(input: $input) {
              ${AGENT_GQL_FIELDS}
            }
          }
        `,
        variables: { input: { id: testAgentId } },
      };
      const response = await makeGraphqlAPIRequest(queryData);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.findOneAgent).toBeDefined();
      expect(response.body.data.findOneAgent.id).toBe(testAgentId);
      expect(response.body.data.findOneAgent.name).toBe('Test Agent for Find');
    });
    it('should return 404 error for non-existent agent', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const queryData = {
        query: gql`
          query FindOneAgent($input: AgentIdInput!) {
            findOneAgent(input: $input) {
              ${AGENT_GQL_FIELDS}
            }
          }
        `,
        variables: { input: { id: nonExistentId } },
      };
      const response = await makeGraphqlAPIRequest(queryData);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');
    });
  });

  describe('findManyAgents', () => {
    const testAgentIds: string[] = [];

    beforeAll(async () => {
      for (let i = 0; i < 3; i++) {
        const operation = createAgentOperation({
          name: `Test Agent ${i + 1}`,
          description: `A test agent ${i + 1} for find many operations`,
          prompt: `You are test agent ${i + 1}.`,
          modelId: 'gpt-4o',
        });
        const response = await makeGraphqlAPIRequest(operation);

        testAgentIds.push(response.body.data.createOneAgent.id);
      }
    });
    afterAll(async () => {
      for (const agentId of testAgentIds) {
        await makeGraphqlAPIRequest(deleteAgentOperation(agentId));
      }
    });
    it('should find all agents successfully', async () => {
      const queryData = {
        query: gql`
          query FindManyAgents {
            findManyAgents {
              ${AGENT_GQL_FIELDS}
            }
          }
        `,
      };
      const response = await makeGraphqlAPIRequest(queryData);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.findManyAgents).toBeDefined();
      expect(Array.isArray(response.body.data.findManyAgents)).toBe(true);
      expect(response.body.data.findManyAgents.length).toBeGreaterThanOrEqual(
        3,
      );
      const testAgentNames = response.body.data.findManyAgents
        .filter((agent: any) => testAgentIds.includes(agent.id))
        .map((agent: any) => agent.name);

      expect(testAgentNames).toContain('Test Agent 1');
      expect(testAgentNames).toContain('Test Agent 2');
      expect(testAgentNames).toContain('Test Agent 3');
    });
  });

  describe('updateOneAgent', () => {
    let testAgentId: string;

    beforeAll(async () => {
      const operation = createAgentOperation({
        name: 'Original Test Agent',
        description: 'Original description',
        prompt: 'Original prompt',
        modelId: 'gpt-4o',
      });
      const response = await makeGraphqlAPIRequest(operation);

      testAgentId = response.body.data.createOneAgent.id;
    });
    afterAll(async () => {
      await makeGraphqlAPIRequest(deleteAgentOperation(testAgentId));
    });
    it('should update an agent successfully', async () => {
      const operation = updateAgentOperation({
        id: testAgentId,
        name: 'Updated Test Agent Admin',
        description: 'Updated description',
        prompt: 'Updated prompt for admin',
        modelId: 'gpt-4o-mini',
      });
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.updateOneAgent).toBeDefined();
      expect(response.body.data.updateOneAgent.id).toBe(testAgentId);
      expect(response.body.data.updateOneAgent.name).toBe(
        'Updated Test Agent Admin',
      );
      expect(response.body.data.updateOneAgent.description).toBe(
        'Updated description',
      );
      expect(response.body.data.updateOneAgent.prompt).toBe(
        'Updated prompt for admin',
      );
      expect(response.body.data.updateOneAgent.modelId).toBe('gpt-4o-mini');
    });
  });

  describe('deleteOneAgent', () => {
    let testAgentId: string;

    beforeAll(async () => {
      const operation = createAgentOperation({
        name: 'Agent to Delete',
        description: 'This agent will be deleted',
        prompt: 'You are an agent that will be deleted.',
        modelId: 'gpt-4o',
      });
      const response = await makeGraphqlAPIRequest(operation);

      testAgentId = response.body.data.createOneAgent.id;
    });
    it('should delete an agent successfully', async () => {
      const operation = deleteAgentOperation(testAgentId);
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.deleteOneAgent).toBeDefined();
      expect(response.body.data.deleteOneAgent.id).toBe(testAgentId);
      expect(response.body.data.deleteOneAgent.name).toBe('Agent to Delete');
      const findQueryData = {
        query: gql`
          query FindOneAgent($input: AgentIdInput!) {
            findOneAgent(input: $input) {
              ${AGENT_GQL_FIELDS}
            }
          }
        `,
        variables: { input: { id: testAgentId } },
      };
      const findResponse = await makeGraphqlAPIRequest(findQueryData);

      expect(findResponse.body.errors).toBeDefined();
      expect(findResponse.body.errors[0].message).toContain('not found');
    });
    it('should return 404 error for non-existent agent', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const operation = deleteAgentOperation(nonExistentId);
      const response = await makeGraphqlAPIRequest(operation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');
    });
  });
});
