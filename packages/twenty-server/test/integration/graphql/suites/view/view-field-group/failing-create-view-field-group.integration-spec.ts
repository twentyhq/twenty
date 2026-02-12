import { faker } from '@faker-js/faker';
import {
  cleanupViewFieldGroupTest,
  setupViewFieldGroupTest,
  type ViewFieldGroupTestSetup,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-group-test.util';
import { createOneCoreViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/create-one-core-view-field-group.util';
import { deleteOneCoreViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/delete-one-core-view-field-group.util';
import { destroyOneCoreViewFieldGroup } from 'test/integration/metadata/suites/view-field-group/utils/destroy-one-core-view-field-group.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';

const normalizeErrorMessage = (error: any) => {
  const UUID_REGEX =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

  return {
    ...error,
    message: error.message?.replace(UUID_REGEX, '{{UUID}}') || error.message,
  };
};

describe('View Field Group Resolver - Failing Create Operation', () => {
  let testSetup: ViewFieldGroupTestSetup;
  let createdViewFieldGroupIds: string[] = [];

  beforeAll(async () => {
    testSetup = await setupViewFieldGroupTest();
  });

  afterEach(async () => {
    for (const viewFieldGroupId of createdViewFieldGroupIds) {
      await deleteOneCoreViewFieldGroup({
        input: {
          id: viewFieldGroupId,
        },
        expectToFail: false,
      });

      await destroyOneCoreViewFieldGroup({
        input: {
          id: viewFieldGroupId,
        },
        expectToFail: false,
      });
    }
  });

  afterAll(async () => {
    await cleanupViewFieldGroupTest(testSetup.testObjectMetadataId);
  });

  type CreateViewFieldGroupTestCase = (testSetup: ViewFieldGroupTestSetup) => {
    input: CreateViewFieldGroupInput;
  };

  const createViewFieldGroupTestCases: EachTestingContext<CreateViewFieldGroupTestCase>[] =
    [
      {
        title: 'non-existent view',
        context: () => ({
          input: {
            name: 'Test Group',
            viewId: faker.string.uuid(),
          },
        }),
      },
    ];

  it.each(eachTestingContextFilter(createViewFieldGroupTestCases))(
    'should fail to create view field group when $title',
    async ({ context }) => {
      const { input } = context(testSetup);
      const response = await createOneCoreViewFieldGroup({
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
});
