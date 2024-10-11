import { Bundle, createAppTester, tools, ZObject } from 'zapier-platform-core';

import App from '../index';
import getBundle from '../utils/getBundle';
import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';
const appTester = createAppTester(App);
tools.env.inject();

const createApiKey = async (z: ZObject, bundle: Bundle) => {
  const query = `
  mutation createApiKey {
    createApiKey(
      data:{${handleQueryParams(bundle.inputData)}}
    )
    {id}
  }`;
  return (await requestDb(z, bundle, query)).data.createApiKey.id;
};

const generateApiKeyToken = async (z: ZObject, bundle: Bundle) => {
  const query = `
  mutation generateApiKeyToken {
    generateApiKeyToken(
      ${handleQueryParams(bundle.inputData)}
    )
    {token}
  }`;
  return (await requestDb(z, bundle, query)).data.generateApiKeyToken.token;
};

describe('custom auth', () => {
  it('passes authentication and returns json', async () => {
    const bundle = getBundle();
    const response = await appTester(App.authentication.test, bundle);
    expect(response.data).toHaveProperty('currentWorkspace');
    expect(response.data.currentWorkspace).toHaveProperty('displayName');
  });

  it('passes authentication with api url and returns json', async () => {
    const bundle = getBundle();
    const bundleWithApiUrl = {
      ...bundle,
      authData: { ...bundle.authData, apiUrl: 'http://localhost:3000' },
    };
    const response = await appTester(App.authentication.test, bundleWithApiUrl);
    expect(response.data).toHaveProperty('currentWorkspace');
    expect(response.data.currentWorkspace).toHaveProperty('displayName');
  });

  it('fail authentication with bad api url', async () => {
    const bundle = getBundle();
    const bundleWithApiUrl = {
      ...bundle,
      authData: { ...bundle.authData, apiUrl: 'http://invalid' },
    };
    try {
      const response = await appTester(
        App.authentication.test,
        bundleWithApiUrl,
      );
      expect(response.data).toHaveProperty('currentWorkspace');
      expect(response.data.currentWorkspace).toHaveProperty('displayName');
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  it('fails on bad auth token format', async () => {
    const bundle = getBundle();
    bundle.authData.apiKey = 'bad';

    try {
      await appTester(App.authentication.test, bundle);
    } catch (error: any) {
      expect(error.message).toContain('UNAUTHENTICATED');
      return;
    }
    throw new Error('appTester should have thrown');
  });

  it('fails on invalid auth token', async () => {
    const expiresAt = '2020-01-01 10:10:10.000';
    const apiKeyBundle = getBundle({
      name: 'Test',
      expiresAt,
    });
    const apiKeyId = await appTester(createApiKey, apiKeyBundle);
    const generateTokenBundle = getBundle({
      apiKeyId: apiKeyId,
      expiresAt,
    });
    const expiredToken = await appTester(
      generateApiKeyToken,
      generateTokenBundle,
    );
    const bundleWithExpiredApiKey = getBundle({});
    bundleWithExpiredApiKey.authData.apiKey = expiredToken;

    try {
      await appTester(App.authentication.test, bundleWithExpiredApiKey);
    } catch (error: any) {
      expect(error.message).toContain('UNAUTHENTICATED');
      return;
    }
    throw new Error('appTester should have thrown');
  });
});
