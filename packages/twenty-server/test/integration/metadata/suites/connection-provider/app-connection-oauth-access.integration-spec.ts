import { http, HttpResponse } from 'msw';
import request from 'supertest';
import {
  type ApplicationWithAppConnection,
  cleanupApplicationWithAppConnection,
  setupApplicationWithAppConnection,
} from 'test/integration/metadata/suites/connection-provider/utils/setup-application-with-app-connection.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const TOKEN_ENDPOINT = 'https://slack.com/api/oauth.v2.access';

describe('app OAuth access while authorization is pending', () => {
  let application: ApplicationWithAppConnection;
  let originalMemberRoleId: string;
  let administratorRoleId: string;
  let tokenExchangeCount: number;
  let tokenEncryption: ConnectedAccountTokenEncryptionService;

  const tokenResponse = () =>
    HttpResponse.json({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      scope: 'chat:write',
    });
  const providerHttp = setupHttpMock(
    http.post(TOKEN_ENDPOINT, () => {
      tokenExchangeCount += 1;

      return tokenResponse();
    }),
  );

  const setMemberRole = (roleId: string) =>
    updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId,
      },
    });

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "applicationId" = $1 ORDER BY id',
      [application.applicationId],
    );

  const startAuthorization = async ({
    visibility,
    reconnectingConnectedAccountId,
  }: {
    visibility: 'user' | 'workspace';
    reconnectingConnectedAccountId?: string;
  }): Promise<string> => {
    const transient = await generateTransientTokenResponse({
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: application.applicationId,
        providerName: application.connectionProviderName,
        transientToken:
          transient.data.generateTransientToken.transientToken.token,
        visibility,
        reconnectingConnectedAccountId,
      })
      .expect(302);
    const authorizationUrl = new URL(response.headers.location);

    expect(authorizationUrl.origin).toBe('https://slack.com');
    const state = authorizationUrl.searchParams.get('state');

    assertIsDefinedOrThrow(state);

    return state;
  };

  const completeAuthorization = async (state: string): Promise<URL> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state, code: 'authorization-code' })
      .expect(302);

    return new URL(response.headers.location);
  };

  beforeAll(async () => {
    application = await setupApplicationWithAppConnection({
      name: 'Pending OAuth access',
    });
    jest.useRealTimers();
    tokenEncryption = getAppProviderByClassName(
      'ConnectedAccountTokenEncryptionService',
    );

    const roles: { userWorkspaceId: string; roleId: string }[] =
      await globalThis.testDataSource.query(
        'SELECT "userWorkspaceId", "roleId" FROM core."roleTarget" WHERE "userWorkspaceId" = ANY($1::uuid[])',
        [
          [
            USER_WORKSPACE_DATA_SEED_IDS.JANE,
            USER_WORKSPACE_DATA_SEED_IDS.JONY,
          ],
        ],
      );
    const administrator = roles.find(
      ({ userWorkspaceId }) =>
        userWorkspaceId === USER_WORKSPACE_DATA_SEED_IDS.JANE,
    );
    const member = roles.find(
      ({ userWorkspaceId }) =>
        userWorkspaceId === USER_WORKSPACE_DATA_SEED_IDS.JONY,
    );

    assertIsDefinedOrThrow(administrator);
    assertIsDefinedOrThrow(member);
    administratorRoleId = administrator.roleId;
    originalMemberRoleId = member.roleId;

    const encryption = getAppProviderByClassName<SecretEncryptionService>(
      'SecretEncryptionService',
    );

    for (const key of ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET']) {
      await globalThis.testDataSource.query(
        `INSERT INTO core."applicationRegistrationVariable" (key, "encryptedValue", "applicationRegistrationId")
         SELECT $1, $2, "applicationRegistrationId" FROM core.application WHERE id = $3`,
        [
          key,
          encryption.encryptVersioned(
            plaintextStringSchema.parse(`test-${key}`),
          ),
          application.applicationId,
        ],
      );
    }
  }, 120000);

  beforeEach(() => {
    tokenExchangeCount = 0;
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE "applicationId" = $1 AND id <> $2',
      [application.applicationId, application.connectedAccountId],
    );
    await globalThis.testDataSource.query(
      'UPDATE core."userWorkspace" SET "deletedAt" = NULL WHERE id = $1',
      [USER_WORKSPACE_DATA_SEED_IDS.JONY],
    );
    await setMemberRole(originalMemberRoleId);
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET visibility = $1, "userWorkspaceId" = $2 WHERE id = $3',
      [
        'workspace',
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        application.connectedAccountId,
      ],
    );
  });

  afterAll(async () => {
    await cleanupApplicationWithAppConnection(application);
  });

  it('rejects a shared Add after its initiating member loses Applications permission', async () => {
    await setMemberRole(administratorRoleId);
    const state = await startAuthorization({ visibility: 'workspace' });
    const original = await readAccounts();

    await setMemberRole(originalMemberRoleId);
    const redirect = await completeAuthorization(state);

    expect(redirect.searchParams.get('errorMessage')).toContain('permission');
    expect(await readAccounts()).toEqual(original);
    expect(tokenExchangeCount).toBe(0);
  });

  it('rejects a personal Add after its initiating membership is removed', async () => {
    const state = await startAuthorization({ visibility: 'user' });
    const original = await readAccounts();

    await globalThis.testDataSource.query(
      'UPDATE core."userWorkspace" SET "deletedAt" = NOW() WHERE id = $1',
      [USER_WORKSPACE_DATA_SEED_IDS.JONY],
    );
    const redirect = await completeAuthorization(state);

    expect(redirect.searchParams.get('errorMessage')).toBeTruthy();
    expect(await readAccounts()).toEqual(original);
    expect(tokenExchangeCount).toBe(0);
  });

  it('preserves a private reconnect target that now belongs to another member', async () => {
    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET visibility = $1, "userWorkspaceId" = $2 WHERE id = $3',
      [
        'user',
        USER_WORKSPACE_DATA_SEED_IDS.JONY,
        application.connectedAccountId,
      ],
    );
    const state = await startAuthorization({
      visibility: 'user',
      reconnectingConnectedAccountId: application.connectedAccountId,
    });

    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "userWorkspaceId" = $1 WHERE id = $2',
      [USER_WORKSPACE_DATA_SEED_IDS.TIM, application.connectedAccountId],
    );
    const original = await readAccounts();
    const redirect = await completeAuthorization(state);

    expect(redirect.searchParams.get('errorMessage')).toBeTruthy();
    expect(await readAccounts()).toEqual(original);
    expect(tokenExchangeCount).toBe(0);
  });

  it('preserves saved credentials when permission is revoked during token exchange', async () => {
    await setMemberRole(administratorRoleId);
    const state = await startAuthorization({
      visibility: 'workspace',
      reconnectingConnectedAccountId: application.connectedAccountId,
    });
    const original = await readAccounts();

    providerHttp.use(
      http.post(TOKEN_ENDPOINT, async () => {
        tokenExchangeCount += 1;
        await setMemberRole(originalMemberRoleId);

        return tokenResponse();
      }),
    );

    const redirect = await completeAuthorization(state);

    expect(redirect.searchParams.get('errorMessage')).toContain('permission');
    expect(await readAccounts()).toEqual(original);
    expect(tokenExchangeCount).toBe(1);
  });

  it('persists a successful personal Add with encrypted tokens and the initiating owner', async () => {
    const redirect = await completeAuthorization(
      await startAuthorization({ visibility: 'user' }),
    );
    const accounts = await readAccounts();
    const added = accounts.find(
      ({ id }) => id !== application.connectedAccountId,
    );

    expect(redirect.searchParams.get('errorMessage')).toBeNull();
    expect(accounts).toHaveLength(2);
    assertIsDefinedOrThrow(added);
    expect(added).toMatchObject({
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });
    expect(
      tokenEncryption.decryptNullable({
        ciphertext: added.accessToken,
        workspaceId: added.workspaceId,
      }),
    ).toBe('new-access-token');
    expect(
      tokenEncryption.decryptNullable({
        ciphertext: added.refreshToken,
        workspaceId: added.workspaceId,
      }),
    ).toBe('new-refresh-token');
  });

  it('reconnects the selected row and clears an omitted refresh token', async () => {
    await setMemberRole(administratorRoleId);
    const [original] = await readAccounts();

    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "refreshToken" = $1 WHERE id = $2',
      [
        tokenEncryption.encrypt({
          plaintext: plaintextStringSchema.parse('previous-refresh-token'),
          workspaceId: original.workspaceId,
        }),
        original.id,
      ],
    );
    providerHttp.use(
      http.post(TOKEN_ENDPOINT, () =>
        HttpResponse.json({
          access_token: 'reconnected-access-token',
          scope: 'chat:write',
        }),
      ),
    );

    const redirect = await completeAuthorization(
      await startAuthorization({
        visibility: 'workspace',
        reconnectingConnectedAccountId: original.id,
      }),
    );
    const accounts = await readAccounts();

    expect(redirect.searchParams.get('errorMessage')).toBeNull();
    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toMatchObject({ id: original.id, refreshToken: null });
    expect(
      tokenEncryption.decryptNullable({
        ciphertext: accounts[0].accessToken,
        workspaceId: accounts[0].workspaceId,
      }),
    ).toBe('reconnected-access-token');
  });
});
