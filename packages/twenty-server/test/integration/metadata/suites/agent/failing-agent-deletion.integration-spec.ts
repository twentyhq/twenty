import { faker } from '@faker-js/faker';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
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

      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    },
  );
});

