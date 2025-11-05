import { OBJECT_METADATA_LABEL_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-label-failing-tests-cases';
import { OBJECT_METADATA_NAMES_FAILING_TEST_CASES } from 'test/integration/metadata/suites/object-metadata/common/object-metadata-names-failing-tests-cases';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const allTestsUseCases = [
  ...OBJECT_METADATA_NAMES_FAILING_TEST_CASES,
  ...OBJECT_METADATA_LABEL_FAILING_TEST_CASES,
];

describe('Object metadata creation should fail', () => {
  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  });

  it.each(allTestsUseCases)('$title', async ({ context }) => {
    const { errors } = await createOneObjectMetadata({
      input: getMockCreateObjectInput(context),
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const firstError = errors[0];

    expect(firstError.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
    expect(firstError.message).toMatchSnapshot();
  });
});
