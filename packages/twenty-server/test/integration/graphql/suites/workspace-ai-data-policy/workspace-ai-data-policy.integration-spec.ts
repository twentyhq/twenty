import { updateAiDataPolicy } from 'test/integration/graphql/suites/workspace-ai-data-policy/utils/update-ai-data-policy.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';

const UNLABELED_CATALOG_MODEL_ID = 'openai/gpt-5.6-luna';

describe('workspace AI data policy', () => {
  afterEach(async () => {
    await updateAiDataPolicy({
      data: { aiDataResidency: null, isAiZeroDataRetentionRequired: false },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });
  });

  it('lets a workspace admin set and lift the policy', async () => {
    const restricted = await updateAiDataPolicy({
      data: { aiDataResidency: 'eu', isAiZeroDataRetentionRequired: true },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(restricted.body.errors).toBeUndefined();
    expect(restricted.body.data.updateWorkspace).toEqual({
      aiDataResidency: 'eu',
      isAiZeroDataRetentionRequired: true,
    });

    const lifted = await updateAiDataPolicy({
      data: { aiDataResidency: null },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(lifted.body.errors).toBeUndefined();
    expect(lifted.body.data.updateWorkspace).toEqual({
      aiDataResidency: null,
      isAiZeroDataRetentionRequired: true,
    });
  });

  it('refuses a member without the security permission', async () => {
    const response = await updateAiDataPolicy({
      data: { aiDataResidency: 'eu' },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.subCode).toBe(
      'PERMISSION_DENIED',
    );
  });

  it('refuses an unknown residency', async () => {
    const response = await updateAiDataPolicy({
      data: { aiDataResidency: 'us' },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('refuses a null zero data retention requirement', async () => {
    const response = await updateAiDataPolicy({
      data: { isAiZeroDataRetentionRequired: null },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });

  it('refuses to pin a model the policy sent in the same update excludes', async () => {
    const response = await updateAiDataPolicy({
      data: {
        isAiZeroDataRetentionRequired: true,
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
      data: { isAiZeroDataRetentionRequired: true },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    const { errors } = await createOneAgent({
      input: {
        label: 'Excluded model agent',
        prompt: 'Answer.',
        modelId: UNLABELED_CATALOG_MODEL_ID,
      },
      gqlFields: 'id',
      expectToFail: true,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(errors[0].extensions.subCode).toBe(
      'MODEL_NOT_ALLOWED_BY_DATA_POLICY',
    );
  });
});
