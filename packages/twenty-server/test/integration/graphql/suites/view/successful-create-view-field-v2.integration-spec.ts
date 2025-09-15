import { createOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-core-view-field.util';
import { assertViewFieldStructure } from 'test/integration/utils/view-test.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { isDefined } from 'twenty-shared/utils';

import { type ViewFieldDTO } from 'src/engine/core-modules/view/dtos/view-field.dto';
import { type CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';

import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from './utils/setup-view-field-test-v2.util';

type TestContext = {
  viewFieldInput: (testSetup: ViewFieldTestSetup) => CreateViewFieldInput;
  expected: Partial<ViewFieldDTO>;
};

describe('View Field Resolver - Successful Create Operations - v2', () => {
  let testSetup: ViewFieldTestSetup;
  let createdViewFieldId: string | undefined;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

  afterEach(async () => {
    if (isDefined(createdViewFieldId)) {
      const {
        data: { deleteCoreViewField },
      } = await deleteOneCoreViewField({
        expectToFail: false,
        input: {
          id: createdViewFieldId,
        },
      });

      expect(deleteCoreViewField.deletedAt).not.toBeNull();
      await destroyOneCoreViewField({
        expectToFail: false,
        input: {
          id: createdViewFieldId,
        },
      });
      createdViewFieldId = undefined;
    }
  });

  const successfulTestCases: EachTestingContext<TestContext>[] = [
    {
      title: 'visible field with position and size',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          position: 1,
          isVisible: true,
          size: 200,
        }),
        expected: {
          position: 1,
          isVisible: true,
          size: 200,
        },
      },
    },
    {
      title: 'hidden field with position and size',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          position: 2,
          isVisible: false,
          size: 100,
        }),
        expected: {
          position: 2,
          isVisible: false,
          size: 100,
        },
      },
    },
    {
      title: 'field with minimum required properties',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
        }),
        expected: {
          position: 0,
          isVisible: true,
          size: 0,
        },
      },
    },
    {
      title: 'field with maximum size',
      context: {
        viewFieldInput: (testSetup) => ({
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          position: 3,
          isVisible: true,
          size: 1000,
        }),
        expected: {
          position: 3,
          isVisible: true,
          size: 1000,
        },
      },
    },
  ];

  test.each(eachTestingContextFilter(successfulTestCases))(
    'Create $title',
    async ({ context: { viewFieldInput, expected } }) => {
      const response = await createOneCoreViewField({
        input: viewFieldInput(testSetup),
        expectToFail: false,
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.createCoreViewField).toBeDefined();
      createdViewFieldId = response.data.createCoreViewField.id;

      assertViewFieldStructure(response.data.createCoreViewField, {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        ...expected,
      });
    },
  );
});
