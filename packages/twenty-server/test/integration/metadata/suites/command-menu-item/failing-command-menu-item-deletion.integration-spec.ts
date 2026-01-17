import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { type DeleteCommandMenuItemFactoryInput } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item-query-factory.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

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
  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

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
});
