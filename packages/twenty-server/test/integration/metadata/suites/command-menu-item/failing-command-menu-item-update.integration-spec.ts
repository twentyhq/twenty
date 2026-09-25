import { faker } from '@faker-js/faker';
import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { updateCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/update-command-menu-item.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';

type TestContext = {
  input: (testSetup: TestSetup) => UpdateCommandMenuItemInput;
};

type TestSetup = {
  testCommandMenuItemId: string;
};

describe('CommandMenuItem update should fail', () => {
  let testCommandMenuItemId: string;

  beforeEach(async () => {
    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId: faker.string.uuid(),
        engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
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
      {
        title:
          'when changing engineComponentKey to a standard key on an item with workflowVersionId',
        context: {
          input: (testSetup) => ({
            id: testSetup.testCommandMenuItemId,
            engineComponentKey: EngineComponentKey.GO_TO_PEOPLE,
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

  it('when the caller lacks the LAYOUTS permission', async () => {
    const { errors } = await updateCommandMenuItem({
      expectToFail: true,
      input: { id: testCommandMenuItemId, label: 'Updated By Member' },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });

  it('when resetting without the LAYOUTS permission', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: gql`
          mutation ResetCommandMenuItem($id: UUID!) {
            resetCommandMenuItem(id: $id) {
              id
            }
          }
        `,
        variables: { id: testCommandMenuItemId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });
});
