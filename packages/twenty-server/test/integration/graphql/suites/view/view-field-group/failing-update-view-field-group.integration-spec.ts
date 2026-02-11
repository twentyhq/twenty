import {
  cleanupViewFieldGroupTest,
  setupViewFieldGroupTest,
  type ViewFieldGroupTestSetup,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-group-test.util';
import { updateOneCoreViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/update-one-core-view-field-group.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/update-view-field-group.input';

const TEST_NOT_EXISTING_VIEW_FIELD_GROUP_ID =
  '20202020-0000-4000-8000-000000000002';

describe('View Field Group Resolver - Failing Update Operation', () => {
  let testSetup: ViewFieldGroupTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldGroupTest();
  });

  afterAll(async () => {
    await cleanupViewFieldGroupTest(testSetup.testObjectMetadataId);
  });

  type UpdateViewFieldGroupTestCase = {
    input: UpdateViewFieldGroupInput;
  };

  const updateViewFieldGroupTestCases: EachTestingContext<UpdateViewFieldGroupTestCase>[] =
    [
      {
        title: 'non-existent view field group',
        context: {
          input: {
            id: TEST_NOT_EXISTING_VIEW_FIELD_GROUP_ID,
            update: {
              name: 'Updated Name',
            },
          },
        },
      },
    ];

  it.each(eachTestingContextFilter(updateViewFieldGroupTestCases))(
    'should fail to update view field group when $title',
    async ({ context }) => {
      const response = await updateOneCoreViewFieldGroup({
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
