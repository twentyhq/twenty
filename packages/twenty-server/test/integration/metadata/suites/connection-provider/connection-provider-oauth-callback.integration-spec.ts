/* global APP_PORT */
import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { buildConnectionProviderManifest } from 'test/integration/metadata/suites/connection-provider/utils/build-connection-provider-manifest.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 as uuidv4 } from 'uuid';

import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const callback = async (query: Record<string, string>) =>
  request(`http://localhost:${APP_PORT}`)
    .get('/auth/apps/callback')
    .query(query);

describe('App OAuth callback endpoint', () => {
  let appId: string;
  let roleId: string;
  let providerId: string;
  let applicationId: string;
  let connectionProviderId: string;

  const signState = (): Promise<string> => {
    const payload: AppOAuthStateJwtPayload = {
      sub: connectionProviderId,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      connectionProviderId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      visibility: 'user',
      reconnectingConnectedAccountId: null,
      redirectLocation: null,
      codeVerifier: null,
    };

    return getAppProviderByClassName<JwtWrapperService>(
      'JwtWrapperService',
    ).signAsyncOrThrow(payload, { expiresIn: '10m' });
  };

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();
    providerId = uuidv4();

    await setupApplicationForSync({
      applicationUniversalIdentifier: appId,
      name: 'Test Application',
      description: 'App for testing the OAuth callback endpoint',
      sourcePath: 'test-oauth-callback',
    });
    jest.useRealTimers();

    await syncApplication({
      manifest: buildConnectionProviderManifest({ appId, roleId, providerId }),
      expectToFail: false,
    });

    const [provider] = await findConnectionProvidersByApplication(appId);

    applicationId = provider.applicationId;
    connectionProviderId = provider.id;
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('redirects a failing callback to the application page of the workspace named in the state', async () => {
    const response = await callback({
      code: 'authorization-code',
      state: await signState(),
    });

    expect(response.status).toBe(302);

    const location = new URL(response.headers.location);

    expect(location.hostname).toMatch(/^apple\./);
    expect(location.pathname).toBe(`/settings/applications/${applicationId}`);
    expect(location.searchParams.get('errorMessage')).toEqual(
      expect.any(String),
    );
  }, 60000);
});
