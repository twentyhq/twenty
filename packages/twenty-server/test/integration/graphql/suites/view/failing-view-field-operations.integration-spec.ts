import { TEST_NOT_EXISTING_VIEW_FIELD_ID } from 'test/integration/constants/test-view-ids.constants';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { updateOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-core-view-field.util';
import { cleanupViewRecords } from 'test/integration/utils/view-test.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';
import { createOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-core-view-field.util';
import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from './utils/setup-view-field-test-v2.util';

describe('View Field Resolver - Failing Operations - v2', () => {
  let testSetup: ViewFieldTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

  beforeEach(async () => {
    await cleanupViewRecords();
  });

  describe('createCoreViewField', () => {
    type CreateViewFieldTestCase = (testSetup: ViewFieldTestSetup) => {
      input: CreateViewFieldInput;
    };

    const createViewFieldTestCases: EachTestingContext<CreateViewFieldTestCase>[] =
      [
        {
          title: 'non-existent field metadata',
          context: (testSetup) => ({
            input: {
              viewId: testSetup.testViewId,
              fieldMetadataId: TEST_NOT_EXISTING_VIEW_FIELD_ID,
            },
          }),
        },
        {
          title: 'non-existent view metadata',
          context: (testSetup) => ({
            input: {
              viewId: TEST_NOT_EXISTING_VIEW_FIELD_ID,
              fieldMetadataId: testSetup.testFieldMetadataId,
            },
          }),
        },
      ];

    it.each(eachTestingContextFilter(createViewFieldTestCases))(
      'should fail to create view field when $title',
      async ({ context }) => {
        const { input } = context(testSetup);
        const response = await createOneCoreViewField({
          input,
          expectToFail: true,
        });

        expect(response.errors).toBeDefined();
        expect(response.errors.length).toBe(1);
        const [firstError] = response.errors;
        expect(firstError).toMatchSnapshot();
      },
    );
  });

  describe('updateCoreViewField', () => {
    type UpdateViewFieldTestCase = {
      input: UpdateViewFieldInput;
    };

    const updateViewFieldTestCases: EachTestingContext<UpdateViewFieldTestCase>[] =
      [
        {
          title: 'non-existent view field',
          context: {
            input: {
              id: TEST_NOT_EXISTING_VIEW_FIELD_ID,
              update: {
                position: 1,
              },
            },
          },
        },
      ];

    it.each(eachTestingContextFilter(updateViewFieldTestCases))(
      'should fail to update view field when $title',
      async ({ context }) => {
        const response = await updateOneCoreViewField({
          input: context.input,
          expectToFail: true,
        });

        expect(response.errors).toBeDefined();
        expect(response.errors.length).toBe(1);
        const [firstError] = response.errors;
        expect(firstError).toMatchSnapshot();
      },
    );
  });

  describe('deleteCoreViewField', () => {
    type DeleteViewFieldTestCase = {
      input: DeleteViewFieldInput;
    };

    const deleteViewFieldTestCases: EachTestingContext<DeleteViewFieldTestCase>[] =
      [
        {
          title: 'non-existent view field',
          context: {
            input: {
              id: TEST_NOT_EXISTING_VIEW_FIELD_ID,
            },
          },
        },
      ];

    it.each(eachTestingContextFilter(deleteViewFieldTestCases))(
      'should fail to delete view field when $title',
      async ({ context }) => {
        const response = await deleteOneCoreViewField({
          input: context.input,
          expectToFail: true,
        });

        expect(response.errors).toBeDefined();
        expect(response.errors.length).toBe(1);
        const [firstError] = response.errors;
        expect(firstError).toMatchSnapshot();
      },
    );
  });

  describe('destroyCoreViewField', () => {
    type DestroyViewFieldTestCase = {
      input: DestroyViewFieldInput;
    };

    const destroyViewFieldTestCases: EachTestingContext<DestroyViewFieldTestCase>[] =
      [
        {
          title: 'non-existent view field',
          context: {
            input: {
              id: TEST_NOT_EXISTING_VIEW_FIELD_ID,
            },
          },
        },
      ];

    it.each(eachTestingContextFilter(destroyViewFieldTestCases))(
      'should fail to destroy view field when $title',
      async ({ context }) => {
        const response = await destroyOneCoreViewField({
          input: context.input,
          expectToFail: true,
        });

        expect(response.errors).toBeDefined();
        expect(response.errors.length).toBe(1);
        const [firstError] = response.errors;
        expect(firstError).toMatchSnapshot();
      },
    );
  });
});
