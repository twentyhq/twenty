import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';

describe('Agent update should succeed', () => {
  let testAgentId: string;

  beforeEach(async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Original Agent Label',
        description: 'Original description',
        icon: 'IconRobot',
        prompt: 'Original prompt',
        modelId: 'gpt-4o',
        responseFormat: { type: 'text' },
        evaluationInputs: ['input 1'],
      },
    });

    testAgentId = data.createOneAgent.id;
  });

  afterEach(async () => {
    await deleteOneAgent({
      expectToFail: false,
      input: { id: testAgentId },
    });
  });

  it('should update agent label', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        label: 'Updated Agent Label',
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      label: 'Updated Agent Label',
      description: 'Original description',
      icon: 'IconRobot',
      prompt: 'Original prompt',
    });
  });

  it('should update agent description', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        description: 'Updated description for the agent',
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      label: 'Original Agent Label',
      description: 'Updated description for the agent',
    });
  });

  it('should update agent icon', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        icon: 'IconSparkles',
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      icon: 'IconSparkles',
    });
  });

  it('should update agent prompt', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        prompt: 'Updated prompt with new instructions',
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      prompt: 'Updated prompt with new instructions',
    });
  });

  it('should update agent modelId', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        modelId: 'gpt-4o-mini',
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      modelId: 'gpt-4o-mini',
    });
  });

  it('should update agent responseFormat from text to json', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        responseFormat: {
          type: 'json',
          schema: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              confidence: { type: 'number' },
            },
          },
        },
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      responseFormat: {
        type: 'json',
        schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            confidence: { type: 'number' },
          },
        },
      },
    });
  });

  it('should update agent responseFormat from json to text', async () => {
    await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        responseFormat: {
          type: 'json',
          schema: { type: 'object', properties: {} },
        },
      },
    });

    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        responseFormat: { type: 'text' },
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      responseFormat: { type: 'text' },
    });
  });

  it('should update agent modelConfiguration', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        modelConfiguration: {
          twitterSearch: {
            enabled: true,
            configuration: {
              temperature: 0.9,
              maxTokens: 2000,
              topP: 0.95,
            },
          },
        },
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      modelConfiguration: {
        twitterSearch: {
          enabled: true,
          configuration: {
            temperature: 0.9,
            maxTokens: 2000,
            topP: 0.95,
          },
        },
      },
    });
  });

  it('should update agent evaluationInputs', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        evaluationInputs: ['new input 1', 'new input 2', 'new input 3'],
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      evaluationInputs: ['new input 1', 'new input 2', 'new input 3'],
    });
  });

  it('should update multiple agent properties at once', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        label: 'Comprehensive Update',
        description: 'Updated multiple fields',
        icon: 'IconBrain',
        prompt: 'New comprehensive prompt',
        modelId: 'gpt-4o-mini',
        responseFormat: {
          type: 'json',
          schema: { type: 'object', properties: {} },
        },
        evaluationInputs: ['eval 1', 'eval 2'],
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      label: 'Comprehensive Update',
      description: 'Updated multiple fields',
      icon: 'IconBrain',
      prompt: 'New comprehensive prompt',
      modelId: 'gpt-4o-mini',
      responseFormat: {
        type: 'json',
        schema: { type: 'object' },
      },
      evaluationInputs: ['eval 1', 'eval 2'],
    });
  });

  it('should sanitize input by trimming whitespace', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        label: '  Updated Label With Spaces  ',
        icon: '  IconRobot  ',
        description: '  Description with spaces  ',
        prompt: '  Prompt with spaces  ',
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      label: 'Updated Label With Spaces',
      icon: 'IconRobot',
      description: 'Description with spaces',
      prompt: 'Prompt with spaces',
    });
  });

  it('should clear optional fields by setting to null', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        icon: null,
        description: null,
        modelConfiguration: null,
      } as any,
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      icon: null,
      description: null,
      modelConfiguration: null,
    });
  });

  it('should clear evaluationInputs by setting to empty array', async () => {
    const { data } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        evaluationInputs: [],
      },
    });

    expect(data.updateOneAgent).toMatchObject({
      id: testAgentId,
      evaluationInputs: [],
    });
  });
});
