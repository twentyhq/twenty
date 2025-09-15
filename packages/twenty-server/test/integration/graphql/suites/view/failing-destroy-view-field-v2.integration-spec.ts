import { TEST_NOT_EXISTING_VIEW_FIELD_ID } from 'test/integration/constants/test-view-ids.constants';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';

import { type DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';

import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from './utils/setup-view-field-test-v2.util';

describe('View Field Resolver - Failing Destroy Operation - v2', () => {
  let testSetup: ViewFieldTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

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

      expect(firstError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(firstError),
      );
    },
  );
});
