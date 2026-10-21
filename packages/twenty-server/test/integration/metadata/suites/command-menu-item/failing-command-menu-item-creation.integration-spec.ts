import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  CommandMenuItemAvailabilityType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

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
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label: '',
        },
      },
    },
    {
      title: 'when creating with missing label',
      context: {
        input: {
          workflowVersionId: faker.string.uuid(),
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
        } as CreateCommandMenuItemInput,
      },
    },
    {
      title: 'when creating with missing engineComponentKey',
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
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating with invalid workflowVersionId (not a UUID)',
      context: {
        input: {
          workflowVersionId: 'not-a-valid-uuid',
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating TRIGGER_WORKFLOW_VERSION without workflowVersionId',
      context: {
        input: {
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating TRIGGER_WORKFLOW_VERSION with frontComponentId',
      context: {
        input: {
          workflowVersionId: faker.string.uuid(),
          frontComponentId: faker.string.uuid(),
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating FRONT_COMPONENT_RENDERER without frontComponentId',
      context: {
        input: {
          engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating FRONT_COMPONENT_RENDERER with workflowVersionId',
      context: {
        input: {
          frontComponentId: faker.string.uuid(),
          workflowVersionId: faker.string.uuid(),
          engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating standard key with workflowVersionId',
      context: {
        input: {
          workflowVersionId: faker.string.uuid(),
          engineComponentKey: EngineComponentKey.GO_TO_PEOPLE,
          label: 'Test Label',
        },
      },
    },
    {
      title: 'when creating standard key with frontComponentId',
      context: {
        input: {
          frontComponentId: faker.string.uuid(),
          engineComponentKey: EngineComponentKey.GO_TO_PEOPLE,
          label: 'Test Label',
        },
      },
    },
  ];

describe('CommandMenuItem creation should fail', () => {
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

  it('when the caller lacks the LAYOUTS permission', async () => {
    const { errors } = await createCommandMenuItem({
      expectToFail: true,
      input: {
        engineComponentKey: EngineComponentKey.GO_TO_PEOPLE,
        label: 'Member Pinned Item',
        isPinned: true,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });

  it('when a GLOBAL command has a conditional display on a record field', async () => {
    const { fieldMetadataId2: nameFieldMetadataId } =
      await fetchTestFieldMetadataIds();

    const { errors } = await createCommandMenuItem({
      expectToFail: true,
      input: {
        workflowVersionId: faker.string.uuid(),
        engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
        label: 'Global Command With Field Rule',
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        conditionalDisplay: {
          recordFilters: [
            {
              id: '0',
              fieldMetadataId: nameFieldMetadataId,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        },
      },
    });

    expect(errors).toMatchObject([
      {
        extensions: {
          code: 'METADATA_VALIDATION_FAILED',
          errors: {
            commandMenuItem: [
              {
                errors: [
                  {
                    code: 'INVALID_COMMAND_MENU_ITEM_INPUT',
                    message:
                      'Conditional display rules on commandMenuItem cannot reference a record field',
                  },
                ],
              },
            ],
          },
        },
      },
    ]);
  });
});
