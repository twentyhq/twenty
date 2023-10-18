import App from '../index';
import {
  Bundle,
  HttpRequestOptions,
  createAppTester,
  tools,
  ZObject,
} from 'zapier-platform-core';
import getBundle from '../utils/getBundle';
const appTester = createAppTester(App);
tools.env.inject();

const generateKey = async (z: ZObject, bundle: Bundle) => {
  const options = {
    url: `${process.env.SERVER_BASE_URL}/graphql`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    body: {
      query: `mutation 
      CreateApiKey {
      createOneApiKey(data:{
      name:"${bundle.inputData.name}", 
      expiresAt: "${bundle.inputData.expiresAt}"
      }) {token}}`,
    },
  } satisfies HttpRequestOptions;
  return z.request(options).then((response) => {
    const results = response.json;
    return results.data.createOneApiKey.token;
  });
};

const apiKey = String(process.env.API_KEY);

describe('custom auth', () => {
  it('passes authentication and returns json', async () => {
    const bundle = getBundle();
    const response = await appTester(App.authentication.test, bundle);
    expect(response.data).toHaveProperty('currentWorkspace');
    expect(response.data.currentWorkspace).toHaveProperty('displayName');
  });

  it('fails on bad auth token format', async () => {
    const bundle = { authData: { apiKey: 'bad' } };

    try {
      await appTester(App.authentication.test, bundle);
    } catch (error: any) {
      expect(error.message).toContain('The API Key you supplied is incorrect');
      return;
    }
    throw new Error('appTester should have thrown');
  });

  it('fails on invalid auth token', async () => {
    const bundle = getBundle({
      name: 'Test',
      expiresAt: '2020-01-01 10:10:10.000',
    });
    const expiredToken = await appTester(generateKey, bundle);
    const bundleWithExpiredApiKey = {
      authData: { apiKey: expiredToken },
    };

    try {
      await appTester(App.authentication.test, bundleWithExpiredApiKey);
    } catch (error: any) {
      expect(error.message).toContain('The API Key you supplied is incorrect');
      return;
    }
    throw new Error('appTester should have thrown');
  });
});
