import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  input: () => {
    id: string;
  };
};

type DeleteOneAgentTestingContext = EachTestingContext<TestContext>[];

describe('Agent deletion should fail', () => {
  const failingAgentDeletionTestCases: DeleteOneAgentTestingContext = [
    {
      title: 'when deleting a non-existent agent',
      context: {
        input: () => ({
          id: faker.string.uuid(),
        }),
      },
    },
  ];

  it.each(eachTestingContextFilter(failingAgentDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { id } = context.input();

      const { errors } = await deleteOneAgent({
        expectToFail: true,
        input: {
          id,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );

  it('should fail when attempting to delete a standard agent', async () => {
    const { data } = await findAgents({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id name isCustom',
    });

    const helperAgent = data.findManyAgents.find(
      (agent) => agent.name === 'helper' && agent.isCustom === false,
    );

    expect(helperAgent).toBeDefined();

    const { errors } = await deleteOneAgent({
      expectToFail: true,
      input: {
        id: helperAgent!.id,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
