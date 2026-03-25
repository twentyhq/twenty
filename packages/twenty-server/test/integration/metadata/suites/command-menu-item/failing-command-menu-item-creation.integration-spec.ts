import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FeatureFlagKey } from 'twenty-shared/types';

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
      title:
        'when creating TRIGGER_WORKFLOW_VERSION without workflowVersionId',
      context: {
        input: {
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label: 'Test Label',
        },
      },
    },
    {
      title:
        'when creating TRIGGER_WORKFLOW_VERSION with frontComponentId',
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
      title:
        'when creating FRONT_COMPONENT_RENDERER without frontComponentId',
      context: {
        input: {
          engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
          label: 'Test Label',
        },
      },
    },
    {
      title:
        'when creating FRONT_COMPONENT_RENDERER with workflowVersionId',
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
