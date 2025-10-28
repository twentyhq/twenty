import {
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
  type ViewFieldTestSetup,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test-v2.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';

const TEST_NOT_EXISTING_VIEW_FIELD_ID = '20202020-0000-4000-8000-000000000001';

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
