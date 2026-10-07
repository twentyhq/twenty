import gql from 'graphql-tag';
import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { insertAppPreferencesConnectedAccount } from 'test/integration/metadata/suites/connection-provider/utils/insert-app-preferences-connected-account.util';
import { setupAppPreferencesConnectionApplication } from 'test/integration/metadata/suites/connection-provider/utils/setup-app-preferences-connection-application.util';
import { setupAppPreferencesSyncedMeeting } from 'test/integration/metadata/suites/connection-provider/utils/setup-app-preferences-synced-meeting.util';
import { startAppPreferencesAuthorization } from 'test/integration/metadata/suites/connection-provider/utils/start-app-preferences-authorization.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

describe('Member app connection disconnect and reconnect', () => {
  let application: Awaited<
    ReturnType<typeof setupAppPreferencesConnectionApplication>
  >;
  const accountId = uuidv4();
  let channelId: string;
  let eventId: string;
  let associationId: string;
  const httpMock = setupHttpMock(
    http.post('https://example.com/oauth/token', () =>
      HttpResponse.json({
        access_token: 'synthetic-initial-access-token',
        refresh_token: 'synthetic-initial-refresh-token',
        token_type: 'Bearer',
        scope: 'read',
      }),
    ),
  );
  const personalPath = () =>
    getSettingsPath(SettingsPath.AppPreferencesApplication, {
      applicationId: application.id,
    });

  const getSignedState = async () => {
    const response = await startAppPreferencesAuthorization({
      applicationId: application.id,
      reconnectingConnectedAccountId: accountId,
      redirectLocation: personalPath(),
    });
    const authorizationUrl = new URL(response.headers.location);
    const state = authorizationUrl.searchParams.get('state');

    expect(response.status).toBe(302);
    expect(authorizationUrl.origin).toBe('https://example.com');

    if (!isDefined(state)) {
      throw new Error('Missing signed OAuth state');
    }

    return state;
  };

  beforeAll(async () => {
    application = await setupAppPreferencesConnectionApplication({
      name: 'Member Lifecycle Preferences',
      configureCredentials: true,
    });
    await insertAppPreferencesConnectedAccount({
      id: accountId,
      applicationId: application.id,
      connectionProviderId: application.providerId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });
    const initialConnection = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state: await getSignedState(), code: 'synthetic-initial-code' });

    expect(initialConnection.status).toBe(302);
    expect(
      new URL(initialConnection.headers.location).searchParams.has(
        'errorMessage',
      ),
    ).toBe(false);
    ({ channelId, eventId, associationId } =
      await setupAppPreferencesSyncedMeeting({
        connectedAccountId: accountId,
      }));
  }, 120000);

  afterAll(async () => {
    await deleteRecordsByIds('calendarChannelEventAssociation', [
      associationId,
    ]);
    await deleteRecordsByIds('calendarEvent', [eventId]);
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  }, 120000);

  it('archives an ordinary member own account, then reconnects it without changing ownership or stored data', async () => {
    const [initialAccount]: { accessToken: string; refreshToken: string }[] =
      await globalThis.testDataSource.query(
        `SELECT "accessToken", "refreshToken" FROM core."connectedAccount" WHERE id = $1`,
        [accountId],
      );

    expect(initialAccount.accessToken).toMatch(/^enc:v2:/);
    expect(initialAccount.refreshToken).toMatch(/^enc:v2:/);

    const disconnect = await makeMetadataApiRequest(
      {
        query: gql`
          mutation DisconnectPersonalPreferenceAccount($id: UUID!) {
            disconnectConnectedAccount(id: $id) {
              id
              archivedAt
              userWorkspaceId
              visibility
            }
          }
        `,
        variables: { id: accountId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(disconnect.body.errors).toBeUndefined();
    expect(disconnect.body.data.disconnectConnectedAccount).toEqual({
      id: accountId,
      archivedAt: expect.any(String),
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      visibility: 'user',
    });

    const [archivedAccount]: {
      archivedAt: Date;
      accessToken: string | null;
      refreshToken: string | null;
    }[] = await globalThis.testDataSource.query(
      `SELECT "archivedAt", "accessToken", "refreshToken" FROM core."connectedAccount" WHERE id = $1`,
      [accountId],
    );

    expect(archivedAccount.archivedAt.getTime()).toBeGreaterThan(0);
    expect(archivedAccount.accessToken).toBeNull();
    expect(archivedAccount.refreshToken).toBeNull();

    httpMock.use(
      http.post(
        'https://example.com/oauth/token',
        async ({ request: tokenRequest }) => {
          const tokenBody: unknown = await tokenRequest.json();

          expect(tokenBody).toEqual(
            expect.objectContaining({
              grant_type: 'authorization_code',
              code: 'synthetic-code',
              client_id: 'synthetic-client_id',
              client_secret: 'synthetic-client_secret',
            }),
          );

          return HttpResponse.json({
            access_token: 'synthetic-new-access-token',
            refresh_token: 'synthetic-new-refresh-token',
            token_type: 'Bearer',
            scope: 'read',
          });
        },
      ),
    );
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state: await getSignedState(), code: 'synthetic-code' });
    const redirect = new URL(response.headers.location);

    expect(response.status).toBe(302);
    expect(redirect.hostname).toBe('apple.localhost');
    expect(redirect.pathname).toBe(personalPath());
    expect(redirect.searchParams.has('errorMessage')).toBe(false);

    const accounts: {
      id: string;
      userWorkspaceId: string;
      visibility: string;
      archivedAt: Date | null;
      accessToken: string;
      refreshToken: string;
      name: string;
    }[] = await globalThis.testDataSource.query(
      `SELECT id, "userWorkspaceId", visibility, "archivedAt", "accessToken", "refreshToken", name
       FROM core."connectedAccount" WHERE "applicationId" = $1 AND "workspaceId" = $2`,
      [application.id, SEED_APPLE_WORKSPACE_ID],
    );

    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toEqual(
      expect.objectContaining({
        id: accountId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        visibility: 'user',
        archivedAt: null,
        name: 'Synthetic preference account',
        accessToken: expect.stringMatching(/^enc:v2:/),
        refreshToken: expect.stringMatching(/^enc:v2:/),
      }),
    );
    const [channel]: {
      id: string;
      connectedAccountId: string;
      isSyncEnabled: boolean;
      syncCursor: string;
    }[] = await globalThis.testDataSource.query(
      `SELECT id, "connectedAccountId", "isSyncEnabled", "syncCursor" FROM core."calendarChannel" WHERE id = $1`,
      [channelId],
    );

    expect(channel).toEqual({
      id: channelId,
      connectedAccountId: accountId,
      isSyncEnabled: false,
      syncCursor: 'stored-sync-cursor',
    });
    expect(
      await findRecordNodesByFilter(
        'calendarEvent',
        'calendarEvents',
        'id title',
        { id: { eq: eventId } },
      ),
    ).toEqual([{ id: eventId, title: 'Stored app meeting' }]);
    expect(
      await findRecordNodesByFilter(
        'calendarChannelEventAssociation',
        'calendarChannelEventAssociations',
        'id calendarChannelId calendarEventId eventExternalId',
        { id: { eq: associationId } },
      ),
    ).toEqual([
      {
        id: associationId,
        calendarChannelId: channelId,
        calendarEventId: eventId,
        eventExternalId: 'stored-app-meeting',
      },
    ]);
  });

  it('preserves success and legacy error behavior for valid older state without applicationId', async () => {
    const jwtWrapperService =
      getAppProviderByClassName<JwtWrapperService>('JwtWrapperService');
    const signedState = await getSignedState();
    const statePayload: AppOAuthStateJwtPayload & {
      iat?: number;
      exp?: number;
    } = await jwtWrapperService.verifyJwtToken(signedState);
    const {
      applicationId: _applicationId,
      iat: _issuedAt,
      exp: _expiresAt,
      ...legacyPayload
    } = statePayload;
    const legacyState = await jwtWrapperService.signAsyncOrThrow(
      legacyPayload,
      { expiresIn: '10m' },
    );

    const deniedResponse = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state: legacyState, error: 'access_denied' });

    expect(new URL(deniedResponse.headers.location).pathname).toBe(
      getSettingsPath(SettingsPath.Accounts),
    );
    httpMock.use(
      http.post('https://example.com/oauth/token', () =>
        HttpResponse.json({
          access_token: 'synthetic-legacy-access-token',
          token_type: 'Bearer',
          scope: 'read',
        }),
      ),
    );
    const successResponse = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state: legacyState, code: 'synthetic-legacy-code' });
    const redirect = new URL(successResponse.headers.location);

    expect(redirect.hostname).toBe('apple.localhost');
    expect(redirect.pathname).toBe(personalPath());
    expect(redirect.searchParams.has('errorMessage')).toBe(false);
  });
});
