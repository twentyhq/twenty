import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test-v2.util';
import { updateOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-core-view-field.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';

const TEST_NOT_EXISTING_VIEW_FIELD_ID = '20202020-0000-4000-8000-000000000001';

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
