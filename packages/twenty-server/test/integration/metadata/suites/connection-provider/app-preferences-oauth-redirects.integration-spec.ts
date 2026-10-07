import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupAppPreferencesConnectionApplication } from 'test/integration/metadata/suites/connection-provider/utils/setup-app-preferences-connection-application.util';
import { startAppPreferencesAuthorization } from 'test/integration/metadata/suites/connection-provider/utils/start-app-preferences-authorization.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('Personal application OAuth return routes', () => {
  let application: Awaited<
    ReturnType<typeof setupAppPreferencesConnectionApplication>
  >;
  let unconfiguredApplication: typeof application;
  const httpMock = setupHttpMock();

  const personalPath = () =>
    getSettingsPath(SettingsPath.AppPreferencesApplication, {
      applicationId: application.id,
    });

  const startAndGetState = async (redirectLocation = personalPath()) => {
    const response = await startAppPreferencesAuthorization({
      applicationId: application.id,
      redirectLocation,
    });
    const providerUrl = new URL(response.headers.location);

    expect(response.status).toBe(302);
    expect(providerUrl.origin).toBe('https://example.com');

    const state = providerUrl.searchParams.get('state');

    if (!isDefined(state)) {
      throw new Error('Provider authorization did not return signed state');
    }

    return state;
  };

  const expectPersonalError = (location: string, pathname = personalPath()) => {
    const redirect = new URL(location);

    expect(redirect.hostname).toBe('apple.localhost');
    expect(redirect.pathname).toBe(pathname);
    expect(redirect.searchParams.get('errorMessage')).toBeTruthy();

    return redirect;
  };

  beforeAll(async () => {
    application = await setupAppPreferencesConnectionApplication({
      name: 'OAuth Return Preferences',
      configureCredentials: true,
    });
    unconfiguredApplication = await setupAppPreferencesConnectionApplication({
      name: 'OAuth Unconfigured Preferences',
    });
  }, 120000);

  afterAll(async () => {
    for (const installedApplication of [application, unconfiguredApplication]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier:
          installedApplication.universalIdentifier,
      });
    }
  }, 120000);

  it('returns a provider configuration failure to the validated member app route', async () => {
    const pathname = getSettingsPath(SettingsPath.AppPreferencesApplication, {
      applicationId: unconfiguredApplication.id,
    });
    const response = await startAppPreferencesAuthorization({
      applicationId: unconfiguredApplication.id,
      redirectLocation: pathname,
    });

    expect(response.status).toBe(302);
    expectPersonalError(response.headers.location, pathname);
  });

  it.each(['removed-provider', 'removed-application'])(
    'returns %s authorization to the validated personal route',
    async (scenario) => {
      const applicationId =
        scenario === 'removed-application' ? uuidv4() : application.id;
      const pathname = getSettingsPath(SettingsPath.AppPreferencesApplication, {
        applicationId,
      });
      const { data } = await generateTransientTokenResponse({
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const response = await request(`http://localhost:${APP_PORT}`)
        .get('/auth/apps/authorize')
        .query({
          applicationId,
          providerName:
            scenario === 'removed-provider' ? 'removed' : 'preferences',
          transientToken: data.generateTransientToken.transientToken.token,
          redirectLocation: pathname,
        });

      expect(response.status).toBe(302);
      expect(
        expectPersonalError(
          response.headers.location,
          pathname,
        ).searchParams.get('errorMessage'),
      ).toContain('not found for application');
    },
  );

  it('returns a denied workspace-shared authorization to personal preferences', async () => {
    const response = await startAppPreferencesAuthorization({
      applicationId: application.id,
      visibility: 'workspace',
      redirectLocation: personalPath(),
    });

    expect(response.status).toBe(302);
    expect(
      expectPersonalError(response.headers.location).searchParams.get(
        'errorMessage',
      ),
    ).toContain('does not have permission');
  });

  it('does not trust a personal route until the transient caller is a workspace member', async () => {
    const transientTokenService =
      getAppProviderByClassName<TransientTokenService>('TransientTokenService');
    const { token } = await transientTokenService.generateTransientToken({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: uuidv4(),
      workspaceMemberId: uuidv4(),
    });
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: application.id,
        providerName: 'preferences',
        transientToken: token,
        redirectLocation: personalPath(),
      });
    const redirect = new URL(response.headers.location);

    expect(response.status).toBe(302);
    expect(redirect.pathname).toBe(getSettingsPath(SettingsPath.Accounts));
    expect(redirect.searchParams.get('errorMessage')).toContain(
      'UserWorkspace not found',
    );
  });

  it.each(['denied', 'missing-code'])(
    'returns a signed %s vendor callback to the current app',
    async (scenario) => {
      const state = await startAndGetState();
      const response = await request(`http://localhost:${APP_PORT}`)
        .get('/auth/apps/callback')
        .query({
          state,
          ...(scenario === 'denied'
            ? { error: 'access_denied', error_description: 'Synthetic denial' }
            : {}),
        });

      expect(response.status).toBe(302);
      expectPersonalError(response.headers.location);
    },
  );

  it('returns a signed token exchange failure to personal preferences', async () => {
    httpMock.use(
      http.post('https://example.com/oauth/token', () =>
        HttpResponse.json({ error: 'invalid_grant' }, { status: 400 }),
      ),
    );
    const state = await startAndGetState();
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state, code: 'synthetic-code' });

    expect(response.status).toBe(302);
    expectPersonalError(response.headers.location);
  });

  it('accepts the signed preferences root on provider denial', async () => {
    const pathname = getSettingsPath(SettingsPath.AppPreferences);
    const state = await startAndGetState(pathname);
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state, error: 'access_denied' });

    expectPersonalError(response.headers.location, pathname);
  });

  it.each(['missing', 'invalid', 'tampered', 'wrong-type'])(
    'uses the fixed safe fallback for %s callback state',
    async (scenario) => {
      let state: string | undefined;

      if (scenario === 'invalid') {
        state = 'invalid-state';
      } else if (scenario === 'tampered') {
        const signedState = await startAndGetState();
        const [header, payload, signature] = signedState.split('.');

        state = `${header}.${payload}.${signature[0] === 'a' ? 'b' : 'a'}${signature.slice(1)}`;
      } else if (scenario === 'wrong-type') {
        const { data } = await generateTransientTokenResponse({
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        });

        state = data.generateTransientToken.transientToken.token;
      }

      const response = await request(`http://localhost:${APP_PORT}`)
        .get('/auth/apps/callback')
        .query({
          state,
          error: 'access_denied',
          redirectLocation: personalPath(),
        });
      const redirect = new URL(response.headers.location);

      expect(response.status).toBe(302);
      expect(redirect.pathname).toBe(getSettingsPath(SettingsPath.Accounts));
      expect(redirect.hostname).not.toBe('example.com');
      expect(redirect.searchParams.get('errorMessage')).toContain(
        'OAuth state signature invalid or expired',
      );
    },
  );

  it.each([
    'https://example.com/settings/app-preferences',
    '//example.com/settings/app-preferences',
    '/settings/app-preferences?next=https://example.com',
    getSettingsPath(SettingsPath.AppPreferencesApplication, {
      applicationId: uuidv4(),
    }),
  ])(
    'keeps signed unexpected return path %s on the current host and legacy route',
    async (redirectLocation) => {
      const state = await startAndGetState(redirectLocation);
      const response = await request(`http://localhost:${APP_PORT}`)
        .get('/auth/apps/callback')
        .query({ state, error: 'access_denied' });
      const redirect = new URL(response.headers.location);

      expect(redirect.hostname).toBe('apple.localhost');
      expect(redirect.pathname).toBe(getSettingsPath(SettingsPath.Accounts));
    },
  );
});
