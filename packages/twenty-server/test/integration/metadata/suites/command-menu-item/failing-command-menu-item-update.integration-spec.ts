import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { updateCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/update-command-menu-item.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';

type TestContext = {
  input: (testSetup: TestSetup) => UpdateCommandMenuItemInput;
};

type TestSetup = {
  testCommandMenuItemId: string;
};

describe('CommandMenuItem update should fail', () => {
  let testCommandMenuItemId: string;

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

  beforeEach(async () => {
    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId: faker.string.uuid(),
        label: 'Test Command Menu Item To Update',
        icon: 'IconOriginal',
        isPinned: false,
      },
    });

    testCommandMenuItemId = data.createCommandMenuItem.id;
  });

  afterEach(async () => {
    if (testCommandMenuItemId) {
      await deleteCommandMenuItem({
        expectToFail: false,
        input: { id: testCommandMenuItemId },
      });
    }
  });

  const failingCommandMenuItemUpdateTestCases: EachTestingContext<TestContext>[] =
    [
      {
        title: 'when updating with empty label',
        context: {
          input: (testSetup) => ({
            id: testSetup.testCommandMenuItemId,
            label: '',
          }),
        },
      },
      {
        title: 'when updating with missing id',
        context: {
          input: () =>
            ({
              label: 'Updated Label',
            }) as UpdateCommandMenuItemInput,
        },
      },
      {
        title: 'when updating with empty id',
        context: {
          input: () => ({
            id: '',
            label: 'Updated Label',
          }),
        },
      },
      {
        title: 'when updating with invalid id (not a UUID)',
        context: {
          input: () => ({
            id: 'not-a-valid-uuid',
            label: 'Updated Label',
          }),
        },
      },
      {
        title: 'when updating a non-existent command menu item',
        context: {
          input: () => ({
            id: faker.string.uuid(),
            label: 'Updated Label',
          }),
        },
      },
    ];

  it.each(eachTestingContextFilter(failingCommandMenuItemUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const testSetup: TestSetup = {
        testCommandMenuItemId,
      };

      const input = context.input(testSetup);

      const { errors } = await updateCommandMenuItem({
        expectToFail: true,
        input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
