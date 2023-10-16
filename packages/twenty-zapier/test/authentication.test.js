const zapier = require('zapier-platform-core');

const App = require('../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('custom auth', ()=> {
  it('passes authentication and returns json', async ()=> {
    const bundle = { authData: {api_key: process.env.ZAPIER_TEST_VALID_API_KEY} };
    const response = await appTester(App.authentication.test, bundle);
    expect(response.data).toHaveProperty('currentWorkspace');
  })

  it('fails on bad auth token format', async () => {
    const bundle = {authData: {apiKey: 'bad'}};

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
      authData: {api_key: process.env.ZAPIER_TEST_VALID_API_KEY},
      apiKeyData: {name: "Test", expiresAt: "2020-01-01 10:10:10.000"}
    };
    const expiredToken = await appTester(App.authentication.generateKey, bundle)
    const bundleWithExpiredApiKey = {
      authData: {api_key: expiredToken}
    }

    try {
      await appTester(App.authentication.test, bundleWithExpiredApiKey);
    } catch (error) {
      expect(error.message).toContain('The API Key you supplied is incorrect');
      return;
    }
    throw new Error('appTester should have thrown');
  });
})
