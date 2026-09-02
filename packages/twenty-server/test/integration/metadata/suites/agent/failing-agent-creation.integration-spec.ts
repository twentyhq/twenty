import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';

type TestContext = {
  input: CreateAgentInput;
};

type GlobalTestContext = {
  existingAgentLabel: string;
};

const globalTestContext: GlobalTestContext = {
  existingAgentLabel: 'Existing Test Agent',
};

type CreateOneAgentTestingContext = EachTestingContext<TestContext>[];

describe('Agent creation should fail', () => {
  let existingAgentId: string | undefined;

  beforeAll(async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: globalTestContext.existingAgentLabel,
        prompt: 'Existing agent for testing',
        modelId: TEST_AI_MODEL_ID,
      },
    });

    existingAgentId = data.createOneAgent.id;
  });

  afterAll(async () => {
    if (isDefined(existingAgentId)) {
      await deleteOneAgent({
        expectToFail: false,
        input: { id: existingAgentId },
      });
    }
  });

  const failingAgentCreationTestCases: CreateOneAgentTestingContext = [
    {
      title: 'when label is missing',
      context: {
        input: {
          prompt: 'Test prompt',
          modelId: TEST_AI_MODEL_ID,
        } as CreateAgentInput,
      },
    },
    {
      title: 'when prompt is missing',
      context: {
        input: {
          label: 'Test Agent Missing Prompt',
          modelId: TEST_AI_MODEL_ID,
        } as CreateAgentInput,
      },
    },
    {
      title: 'when modelId is missing',
      context: {
        input: {
          label: 'Test Agent Missing ModelId',
          prompt: 'Test prompt',
        } as CreateAgentInput,
      },
    },
    {
      title: 'when label is empty string',
      context: {
        input: {
          label: '',
          prompt: 'Test prompt',
          modelId: TEST_AI_MODEL_ID,
        },
      },
    },
    {
      title: 'when prompt is empty string',
      context: {
        input: {
          label: 'Empty Prompt Agent',
          prompt: '',
          modelId: TEST_AI_MODEL_ID,
        },
      },
    },
    {
      title: 'when modelId is empty string',
      context: {
        input: {
          label: 'Empty ModelId Agent',
          prompt: 'Test prompt',
          modelId: '' as any,
        },
      },
    },
    {
      title: 'when computed name already exists',
      context: {
        input: {
          label: globalTestContext.existingAgentLabel,
          prompt: 'Duplicate agent',
          modelId: TEST_AI_MODEL_ID,
        },
      },
    },
    {
      title: 'when responseFormat has invalid type',
      context: {
        input: {
          label: 'Invalid Response Format Agent',
          prompt: 'Test prompt',
          modelId: TEST_AI_MODEL_ID,
          responseFormat: {
            type: 'invalid',
          } as any,
        },
      },
    },
    {
      title: 'when responseFormat type is json but schema is missing',
      context: {
        input: {
          label: 'JSON Without Schema Agent',
          prompt: 'Test prompt',
          modelId: TEST_AI_MODEL_ID,
          responseFormat: {
            type: 'json',
          } as any,
        },
      },
    },
    {
      title: 'when responseFormat type is text but schema is present',
      context: {
        input: {
          label: 'Text With Schema Agent',
          prompt: 'Test prompt',
          modelId: TEST_AI_MODEL_ID,
          responseFormat: {
            type: 'text',
            schema: { type: 'object' },
          } as any,
        },
      },
    },
  ];

  it.each(eachTestingContextFilter(failingAgentCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneAgent({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
