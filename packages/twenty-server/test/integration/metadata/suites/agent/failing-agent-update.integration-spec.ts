import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';

type TestContext = {
  input: (testSetup: TestSetup) => UpdateAgentInput;
};

type TestSetup = {
  testAgentId: string;
  existingAgentLabelForDuplicate: string;
};

type GlobalTestContext = {
  existingAgentLabelForDuplicate: string;
};

const globalTestContext: GlobalTestContext = {
  existingAgentLabelForDuplicate: 'Existing Agent For Duplicate Test',
};

type UpdateOneAgentTestingContext = EachTestingContext<TestContext>[];

describe('Agent update should fail', () => {
  let testAgentId: string;
  let existingAgentIdForDuplicate: string;

  beforeAll(async () => {
    const { data: duplicateData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: globalTestContext.existingAgentLabelForDuplicate,
        prompt: 'Existing agent for duplicate test',
        modelId: 'gpt-4o',
      },
    });

    existingAgentIdForDuplicate = duplicateData.createOneAgent.id;
  });

  beforeEach(async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Test Agent To Update',
        description: 'Original description',
        icon: 'IconRobot',
        prompt: 'Original prompt',
        modelId: 'gpt-4o',
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

  afterAll(async () => {
    await deleteOneAgent({
      expectToFail: false,
      input: { id: existingAgentIdForDuplicate },
    });
  });

  const failingAgentUpdateTestCases: UpdateOneAgentTestingContext = [
    {
      title: 'when updating label to one that already exists',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          label: testSetup.existingAgentLabelForDuplicate,
        }),
      },
    },
    {
      title: 'when updating with empty label',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          label: '',
        }),
      },
    },
    {
      title: 'when updating with empty prompt',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          prompt: '',
        }),
      },
    },
    {
      title: 'when updating with empty modelId',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          modelId: '' as any,
        }),
      },
    },
    {
      title: 'when settings null required properties',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          label: null,
          prompt: null,
          modelId: null,
        }),
      },
    },
    {
      title: 'when updating responseFormat with invalid type',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          responseFormat: {
            type: 'invalid',
          } as any,
        }),
      },
    },
    {
      title: 'when updating responseFormat type to json without schema',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          responseFormat: {
            type: 'json',
          } as any,
        }),
      },
    },
    {
      title: 'when updating responseFormat type to text with schema',
      context: {
        input: (testSetup) => ({
          id: testSetup.testAgentId,
          responseFormat: {
            type: 'text',
            schema: { type: 'object' },
          } as any,
        }),
      },
    },
  ];

  it.each(eachTestingContextFilter(failingAgentUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const testSetup: TestSetup = {
        testAgentId,
        existingAgentLabelForDuplicate:
          globalTestContext.existingAgentLabelForDuplicate,
      };

      const input = context.input(testSetup);

      const { errors } = await updateOneAgent({
        expectToFail: true,
        input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );

  it('should fail when updating a non-existent agent', async () => {
    const nonExistentAgentId = faker.string.uuid();

    const { errors } = await updateOneAgent({
      expectToFail: true,
      input: {
        id: nonExistentAgentId,
        label: 'Updated Label',
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail when attempting to update a standard agent', async () => {
    const { data } = await findAgents({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id name isCustom',
    });

    const helperAgent = data.findManyAgents.find(
      (agent) => agent.name === 'helper' && agent.isCustom === false,
    );

    expect(helperAgent).toBeDefined();

    const { errors } = await updateOneAgent({
      expectToFail: true,
      input: {
        id: helperAgent!.id,
        label: 'Attempted Update to Standard Agent',
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
