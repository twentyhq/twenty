import { getAiProviders } from 'test/integration/graphql/suites/user-session/utils/get-ai-providers.util';
import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { gql } from 'graphql-tag';

const ADD_AI_PROVIDER = gql`
  mutation AddAiProvider($providerName: String!, $providerConfig: JSON!) {
    addAiProvider(providerName: $providerName, providerConfig: $providerConfig)
  }
`;

const REMOVE_AI_PROVIDER = gql`
  mutation RemoveAiProvider($providerName: String!) {
    removeAiProvider(providerName: $providerName)
  }
`;

const OPENAI_OVERRIDE = {
  npm: '@ai-sdk/openai',
  label: 'Openai',
  name: 'openai',
  apiKey: 'sk-test-override',
};

describe('Admin panel AI provider catalog override', () => {
  afterAll(async () => {
    await deleteConfigVariable({ input: { key: 'AI_PROVIDERS' } }).catch(
      () => {},
    );
  });

  it('should refuse a custom provider named like a built-in provider', async () => {
    const response = await makeAdminPanelApiRequest({
      query: ADD_AI_PROVIDER,
      variables: { providerName: 'openai', providerConfig: OPENAI_OVERRIDE },
    });

    expect(
      (response.body.errors?.[0] as { extensions?: { subCode?: string } })
        ?.extensions?.subCode,
    ).toBe('BUILT_IN_AI_PROVIDER_NAME');
  });

  it('should list an AI_PROVIDERS entry shadowing a built-in provider as custom until it is removed', async () => {
    await createConfigVariable({
      input: { key: 'AI_PROVIDERS', value: { openai: OPENAI_OVERRIDE } },
    });

    const { data: overriddenData } = await getAiProviders({});

    expect(overriddenData.getAiProviders.openai).toMatchObject({
      source: 'custom',
    });
    expect(overriddenData.getAiProviders.openai).not.toHaveProperty(
      'apiKeyConfigVariable',
    );

    await makeAdminPanelApiRequest({
      query: REMOVE_AI_PROVIDER,
      variables: { providerName: 'openai' },
    });

    const { data: restoredData } = await getAiProviders({});

    expect(restoredData.getAiProviders.openai).toMatchObject({
      source: 'catalog',
      apiKeyConfigVariable: 'OPENAI_API_KEY',
    });
  });
});
