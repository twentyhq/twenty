const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

const generateKey = async (z, bundle) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    body: {
      query: `mutation createApiKey {createOneApiKey(data:{name:"${bundle.apiKeyData.name}", expiresAt: "${bundle.apiKeyData.expiresAt}"}) {token}}`,
    },
  };
  return z.request(options).then((response) => {
    return response.token;
  });
};

describe('custom auth', () => {
  it('passes authentication and returns json', async () => {
    const bundle = { authData: { apiKey: process.env.API_KEY } };
    const response = await appTester(App.authentication.test, bundle);
    expect(response.data).toHaveProperty('currentWorkspace');
    expect(response.data.currentWorkspace).toHaveProperty('displayName');
  });

  it('fails on bad auth token format', async () => {
    const bundle = { authData: { apiKey: 'bad' } };

    try {
      await appTester(App.authentication.test, bundle);
    } catch (error) {
      expect(error.message).toContain('The API Key you supplied is incorrect');
      return;
    }
    throw new Error('appTester should have thrown');
  });

  it('fails on invalid auth token', async () => {
    const bundle = {
      authData: { apiKey: process.env.API_KEY },
      apiKeyData: { name: 'Test', expiresAt: '2020-01-01 10:10:10.000' },
    };
    const expiredToken = await appTester(generateKey, bundle);
    const bundleWithExpiredApiKey = {
      authData: { apiKey: expiredToken },
    };

    try {
      await appTester(App.authentication.test, bundleWithExpiredApiKey);
    } catch (error) {
      expect(error.message).toContain('The API Key you supplied is incorrect');
      return;
    }
    throw new Error('appTester should have thrown');
  });
});
