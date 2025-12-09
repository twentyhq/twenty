import { faker } from '@faker-js/faker';
import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test-v2.util';
import { createOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-core-view-field.util';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { findCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/find-core-view-fields.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

const normalizeErrorMessage = (error: any) => {
  const UUID_REGEX =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

  return {
    ...error,
    message: error.message?.replace(UUID_REGEX, '{{UUID}}') || error.message,
  };
};

describe('View Field Resolver - Failing Create Operation - v2', () => {
  let testSetup: ViewFieldTestSetup;
  let createdFlatViewFieldIds: string[] = [];

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterEach(async () => {
    for (const viewFieldId of createdFlatViewFieldIds) {
      await deleteOneCoreViewField({
        input: {
          id: viewFieldId,
        },
        expectToFail: false,
      });

      await destroyOneCoreViewField({
        input: {
          id: viewFieldId,
        },
        expectToFail: false,
      });
    }
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

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
            fieldMetadataId: faker.string.uuid(),
          },
        }),
      },
      {
        title: 'non-existent view metadata',
        context: (testSetup) => ({
          input: {
            viewId: faker.string.uuid(),
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

      expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');

      const normalizedError = normalizeErrorMessage(firstError);

      expect(normalizedError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(normalizedError),
      );
    },
  );

  it('Should fail to create a conflicting view field on view and field metadata', async () => {
    const viewFieldId = '20202020-7ace-42ee-aecf-2b1c1bd34bce';
    const {
      data: {
        createCoreViewField: { id: createdFlatViewFieldId },
      },
    } = await createOneCoreViewField({
      input: {
        id: viewFieldId,
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
      },
      expectToFail: false,
    });

    createdFlatViewFieldIds.push(createdFlatViewFieldId);

    const {
      data: { getCoreViewFields },
    } = await findCoreViewFields({
      viewId: testSetup.testViewId,
      expectToFail: false,
      gqlFields: `
        id
        fieldMetadataId
        viewId
      `,
    });

    expect(getCoreViewFields).toStrictEqual([
      {
        id: viewFieldId,
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
      },
    ]);

    const response = await createOneCoreViewField({
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
      },
      expectToFail: true,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors.length).toBe(1);
    const [firstError] = response.errors;

    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');

    const normalizedError = normalizeErrorMessage(firstError);

    expect(normalizedError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(normalizedError),
    );
  });
});
