import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { OBJECT_METADATA_LABEL_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-label-failing-tests-cases';
import { OBJECT_METADATA_NAMES_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-names-failing-tests-cases';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { eachTestingContextFilter } from 'twenty-shared/testing';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

const allTestsUseCases = [
  ...OBJECT_METADATA_NAMES_FAILING_TEST_CASES,
  ...OBJECT_METADATA_LABEL_FAILING_TEST_CASES,
];

describe('Object metadata creation should fail v2', () => {
  beforeAll(async () => {
    const enableWorkspaceMigrationV2 = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      true,
    );

    await makeGraphqlAPIRequest(enableWorkspaceMigrationV2);
  });

  afterAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      false,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);
  });
  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneObjectMetadata({
        input: getMockCreateObjectInput(context),
        expectToFail: true,
      });

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors[0]),
      );
    },
  );
});
