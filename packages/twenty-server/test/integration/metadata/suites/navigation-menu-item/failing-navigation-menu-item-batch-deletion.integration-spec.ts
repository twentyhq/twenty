import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteManyNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-many-navigation-menu-items.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  ids: string[];
};

const failingBatchDeletionTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when deleting with non-existent id',
    context: {
      ids: [faker.string.uuid()],
    },
  },
  {
    title: 'when batch contains a non-existent id among valid ones',
    context: {
      ids: [faker.string.uuid(), faker.string.uuid()],
    },
  },
];

describe('NavigationMenuItem batch deletion should fail', () => {
  it.each(eachTestingContextFilter(failingBatchDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await deleteManyNavigationMenuItems({
        expectToFail: true,
        ids: context.ids,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
