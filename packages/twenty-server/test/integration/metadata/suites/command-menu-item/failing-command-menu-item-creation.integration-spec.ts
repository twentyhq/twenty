import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';

type TestContext = {
  input: CreateCommandMenuItemInput;
};

const failingCommandMenuItemCreationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when creating with empty label',
      context: {
        input: {
          workflowVersionId: faker.string.uuid(),
          label: '',
        },
      },
    },
    {
      title: 'when creating with missing label',
      context: {
        input: {
          workflowVersionId: faker.string.uuid(),
        } as CreateCommandMenuItemInput,
      },
    },
    {
      title: 'when creating with missing workflowVersionId',
      context: {
        input: {
          label: 'Test Label',
        } as CreateCommandMenuItemInput,
      },
    },
    {
      title: 'when creating with empty workflowVersionId',
      context: {
        input: {
          workflowVersionId: '',
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating with invalid workflowVersionId (not a UUID)',
      context: {
        input: {
          workflowVersionId: 'not-a-valid-uuid',
          label: 'Test Label',
        },
      },
    },
  ];

describe('CommandMenuItem creation should fail', () => {
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

  it.each(eachTestingContextFilter(failingCommandMenuItemCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createCommandMenuItem({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
