import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateAiDataPolicy } from 'test/integration/graphql/suites/workspace-ai-data-policy/utils/update-ai-data-policy.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const UNLABELED_CATALOG_MODEL_ID = 'openai/gpt-5.6-luna';

const NO_POLICY = {
  dataResidency: null,
  isZeroDataRetentionRequired: false,
};
const EU_ZERO_RETENTION_POLICY = {
  dataResidency: 'eu',
  isZeroDataRetentionRequired: true,
};
const ZERO_RETENTION_POLICY = {
  dataResidency: null,
  isZeroDataRetentionRequired: true,
};

const setAiDataPolicyFlag = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_AI_DATA_POLICY_ENABLED,
    value,
    expectToFail: false,
  });

const createAgentOnUnlabeledModel = ({
  expectToFail,
}: {
  expectToFail: boolean;
}) =>
  createOneAgent({
    input: {
      label: 'Excluded model agent',
      prompt: 'Answer.',
      modelId: UNLABELED_CATALOG_MODEL_ID,
    },
    gqlFields: 'id',
    expectToFail,
    token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

const readAiDataPolicy = () =>
  makeMetadataApiRequest(
    {
      query: gql`
        query {
          currentWorkspace {
            aiDataPolicy {
              dataResidency
            }
          }
        }
      `,
    },
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
  );

describe('workspace AI data policy', () => {
  beforeEach(async () => {
    await setAiDataPolicyFlag(true);
  });

  afterEach(async () => {
    await setAiDataPolicyFlag(true);
    await updateAiDataPolicy({
      data: { aiDataPolicy: NO_POLICY },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
  });

  it('lets a workspace admin set and lift the policy', async () => {
    const restricted = await updateAiDataPolicy({
      data: { aiDataPolicy: EU_ZERO_RETENTION_POLICY },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(restricted.body.errors).toBeUndefined();
    expect(restricted.body.data.updateWorkspace.aiDataPolicy).toEqual(
      EU_ZERO_RETENTION_POLICY,
    );

    const lifted = await updateAiDataPolicy({
      data: { aiDataPolicy: NO_POLICY },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(lifted.body.errors).toBeUndefined();
    expect(lifted.body.data.updateWorkspace.aiDataPolicy).toEqual(NO_POLICY);
  });

  it('refuses a member without the security permission', async () => {
    const response = await updateAiDataPolicy({
      data: { aiDataPolicy: EU_ZERO_RETENTION_POLICY },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.subCode).toBe(
      'PERMISSION_DENIED',
    );
  });

  it.each([
    ['an unknown residency', { ...NO_POLICY, dataResidency: 'us' }],
    ['a missing residency', { isZeroDataRetentionRequired: true }],
    [
      'a null retention requirement',
      { dataResidency: 'eu', isZeroDataRetentionRequired: null },
    ],
    ['a null policy', null],
  ])('refuses %s', async (_label, aiDataPolicy) => {
    const response = await updateAiDataPolicy({
      data: { aiDataPolicy },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('refuses to pin a model the policy sent in the same update excludes', async () => {
    const response = await updateAiDataPolicy({
      data: {
        aiDataPolicy: ZERO_RETENTION_POLICY,
        aiModelIdByTier: { fast: UNLABELED_CATALOG_MODEL_ID },
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].message).toContain(
      "does not meet the workspace's AI data policy",
    );
  });

  it('refuses an agent on a model the policy excludes', async () => {
    await updateAiDataPolicy({
      data: { aiDataPolicy: ZERO_RETENTION_POLICY },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    const { errors } = await createAgentOnUnlabeledModel({
      expectToFail: true,
    });

    expect(errors[0].extensions.subCode).toBe(
      'MODEL_NOT_ALLOWED_BY_DATA_POLICY',
    );
  });

  describe('with the feature flag off', () => {
    it('refuses to set a policy', async () => {
      await setAiDataPolicyFlag(false);

      const response = await updateAiDataPolicy({
        data: { aiDataPolicy: EU_ZERO_RETENTION_POLICY },
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(response.body.errors[0].extensions.subCode).toBe(
        'PERMISSION_DENIED',
      );
    });

    it('ignores a stored policy until the flag is back on', async () => {
      await updateAiDataPolicy({
        data: { aiDataPolicy: ZERO_RETENTION_POLICY },
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });
      await setAiDataPolicyFlag(false);

      const read = await readAiDataPolicy();

      expect(read.body.data.currentWorkspace.aiDataPolicy).toBeNull();

      const { errors: errorsWithFlagOff } = await createAgentOnUnlabeledModel({
        expectToFail: false,
      });

      expect(errorsWithFlagOff).toBeUndefined();

      await setAiDataPolicyFlag(true);

      const { errors: errorsWithFlagOn } = await createAgentOnUnlabeledModel({
        expectToFail: true,
      });

      expect(errorsWithFlagOn[0].extensions.subCode).toBe(
        'MODEL_NOT_ALLOWED_BY_DATA_POLICY',
      );
    });
  });
});
