import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { type DeleteCommandMenuItemFactoryInput } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item-query-factory.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { findCommandMenuItemByEngineComponentKey } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-item-by-engine-component-key.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

type TestContext = {
  input: DeleteCommandMenuItemFactoryInput;
};

const failingCommandMenuItemDeletionTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when deleting a non-existent command menu item',
      context: {
        input: {
          id: faker.string.uuid(),
        },
      },
    },
    {
      title: 'when deleting with missing id',
      context: {
        input: {} as DeleteCommandMenuItemFactoryInput,
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

describe('CommandMenuItem deletion should fail', () => {
  it.each(eachTestingContextFilter(failingCommandMenuItemDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await deleteCommandMenuItem({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );

  it('when deleting a locked command', async () => {
    const { id } = await findCommandMenuItemByEngineComponentKey(
      EngineComponentKey.SAVE_PAGE,
    );

    const { errors } = await deleteCommandMenuItem({
      expectToFail: true,
      input: { id },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when the caller lacks the LAYOUTS permission', async () => {
    const { errors } = await deleteCommandMenuItem({
      expectToFail: true,
      input: { id: faker.string.uuid() },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });
});
