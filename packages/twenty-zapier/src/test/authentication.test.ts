import { createAppTester, tools } from 'zapier-platform-core';

import App from '../index';
import getBundle from '../utils/getBundle';
const appTester = createAppTester(App);
tools.env.inject();

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
});
