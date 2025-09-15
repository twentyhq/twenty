import { TEST_NOT_EXISTING_VIEW_FIELD_ID } from 'test/integration/constants/test-view-ids.constants';
import { updateOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-core-view-field.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';

import { type UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';

import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from './utils/setup-view-field-test-v2.util';

describe('View Field Resolver - Failing Update Operation - v2', () => {
  let testSetup: ViewFieldTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

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

      expect(firstError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(firstError),
      );
    },
  );
});
