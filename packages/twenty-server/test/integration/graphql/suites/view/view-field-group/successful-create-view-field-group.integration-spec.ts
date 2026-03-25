import {
  type ViewFieldGroupTestSetup,
  cleanupViewFieldGroupTest,
  setupViewFieldGroupTest,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-group-test.util';
import { createOneViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/create-one-view-field-group.util';
import { deleteOneViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/delete-one-view-field-group.util';
import { destroyOneViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/destroy-one-view-field-group.util';
import { assertViewFieldGroupStructure } from 'test/integration/utils/view-test.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';
import { type ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';

type TestContext = {
  viewFieldGroupInput: (
    testSetup: ViewFieldGroupTestSetup,
  ) => CreateViewFieldGroupInput;
  expected: Partial<ViewFieldGroupDTO>;
};

describe('View Field Group Resolver - Successful Create Operations', () => {
  let testSetup: ViewFieldGroupTestSetup;
  let createdViewFieldGroupId: string | undefined;

  beforeAll(async () => {
    testSetup = await setupViewFieldGroupTest();
  });

  afterAll(async () => {
    await cleanupViewFieldGroupTest(testSetup.testObjectMetadataId);
  });

  afterEach(async () => {
    if (isDefined(createdViewFieldGroupId)) {
      const {
        data: { deleteViewFieldGroup },
      } = await deleteOneViewFieldGroup({
        expectToFail: false,
        input: {
          id: createdViewFieldGroupId,
        },
      });

      expect(deleteViewFieldGroup.deletedAt).not.toBeNull();
      await destroyOneViewFieldGroup({
        expectToFail: false,
        input: {
          id: createdViewFieldGroupId,
        },
      });
      createdViewFieldGroupId = undefined;
    }
  });

  const successfulTestCases: EachTestingContext<TestContext>[] = [
    {
      title: 'visible group with position',
      context: {
        viewFieldGroupInput: (testSetup) => ({
          name: 'Test Group',
          viewId: testSetup.testViewId,
          position: 1,
          isVisible: true,
        }),
        expected: {
          name: 'Test Group',
          position: 1,
          isVisible: true,
        },
      },
    },
    {
      title: 'hidden group with position',
      context: {
        viewFieldGroupInput: (testSetup) => ({
          name: 'Hidden Group',
          viewId: testSetup.testViewId,
          position: 2,
          isVisible: false,
        }),
        expected: {
          name: 'Hidden Group',
          position: 2,
          isVisible: false,
        },
      },
    },
    {
      title: 'group with minimum required properties',
      context: {
        viewFieldGroupInput: (testSetup) => ({
          name: 'Minimal Group',
          viewId: testSetup.testViewId,
        }),
        expected: {
          name: 'Minimal Group',
          position: 0,
          isVisible: true,
        },
      },
    },
  ];

  test.each(eachTestingContextFilter(successfulTestCases))(
    'Create $title',
    async ({ context: { viewFieldGroupInput, expected } }) => {
      const response = await createOneViewFieldGroup({
        input: viewFieldGroupInput(testSetup),
        expectToFail: false,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.createViewFieldGroup).toBeDefined();
      createdViewFieldGroupId = response.data.createViewFieldGroup.id;

      assertViewFieldGroupStructure(response.data.createViewFieldGroup, {
        viewId: testSetup.testViewId,
        ...expected,
      });
    },
  );
});
