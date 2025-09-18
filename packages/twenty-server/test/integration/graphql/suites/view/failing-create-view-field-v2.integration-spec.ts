import { createOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-core-view-field.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { faker } from '@faker-js/faker';

import { type CreateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/create-view-field.input';

import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from './utils/setup-view-field-test-v2.util';

describe('View Field Resolver - Failing Create Operation - v2', () => {
  let testSetup: ViewFieldTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
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

      expect(firstError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(firstError),
      );
    },
  );
});
