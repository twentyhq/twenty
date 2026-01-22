import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { type DeleteNavigationMenuItemFactoryInput } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item-query-factory.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  input: DeleteNavigationMenuItemFactoryInput;
};

const failingNavigationMenuItemDeletionTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when deleting a non-existent navigation menu item',
      context: {
        input: {
          id: faker.string.uuid(),
        },
      },
    },
    {
      title: 'when deleting with missing id',
      context: {
        input: {} as DeleteNavigationMenuItemFactoryInput,
      },
    },
    {
      title: 'when deleting with empty id',
      context: {
        input: {
          id: '',
        },
      },
    },
    {
      title: 'when deleting with invalid id (not a UUID)',
      context: {
        input: {
          id: 'not-a-valid-uuid',
        },
      },
    },
  ];

describe('NavigationMenuItem deletion should fail', () => {
  it.each(eachTestingContextFilter(failingNavigationMenuItemDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await deleteNavigationMenuItem({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
