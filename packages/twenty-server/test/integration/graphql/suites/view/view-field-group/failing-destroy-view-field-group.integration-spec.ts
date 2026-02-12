import {
  cleanupViewFieldGroupTest,
  setupViewFieldGroupTest,
  type ViewFieldGroupTestSetup,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-group-test.util';
import { destroyOneCoreViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/destroy-one-core-view-field-group.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type DestroyViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/destroy-view-field-group.input';

const TEST_NOT_EXISTING_VIEW_FIELD_GROUP_ID =
  '20202020-0000-4000-8000-000000000002';

describe('View Field Group Resolver - Failing Destroy Operation', () => {
  let testSetup: ViewFieldGroupTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldGroupTest();
  });

  afterAll(async () => {
    await cleanupViewFieldGroupTest(testSetup.testObjectMetadataId);
  });

  type DestroyViewFieldGroupTestCase = {
    input: DestroyViewFieldGroupInput;
  };

  const destroyViewFieldGroupTestCases: EachTestingContext<DestroyViewFieldGroupTestCase>[] =
    [
      {
        title: 'non-existent view field group',
        context: {
          input: {
            id: TEST_NOT_EXISTING_VIEW_FIELD_GROUP_ID,
          },
        },
      },
    ];

  it.each(eachTestingContextFilter(destroyViewFieldGroupTestCases))(
    'should fail to destroy view field group when $title',
    async ({ context }) => {
      const response = await destroyOneCoreViewFieldGroup({
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
