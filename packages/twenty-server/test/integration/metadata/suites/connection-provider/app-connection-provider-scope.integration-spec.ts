import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { generateTransientToken } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  type ConnectionProviderManifest,
  type ConnectionProviderScope,
} from 'twenty-shared/application';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import {
  type ConnectedAccountEntity,
  type ConnectedAccountScope,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APPLICATION_IDENTIFIER = v4();
const ROLE_IDENTIFIER = v4();
const WORKSPACE_PROVIDER_IDENTIFIER = v4();
const USER_PROVIDER_IDENTIFIER = v4();
const TOKEN_ENDPOINT = 'https://scoped-provider.example.com/token';

const buildProvider = ({
  universalIdentifier,
  name,
  scope,
}: {
  universalIdentifier: string;
  name: string;
  scope?: ConnectionProviderScope;
}): ConnectionProviderManifest => ({
  universalIdentifier,
  name,
  displayName: name,
  type: 'oauth',
  ...(isDefined(scope) ? { scope } : {}),
  oauth: {
    authorizationEndpoint: 'https://scoped-provider.example.com/authorize',
    tokenEndpoint: TOKEN_ENDPOINT,
    scopes: ['read'],
    clientIdVariable: 'CLIENT_ID',
    clientSecretVariable: 'CLIENT_SECRET',
  },
});

const syncProviders = async (
  workspaceProviderScope?: ConnectionProviderScope,
) => {
  const { errors } = await syncApplication({
    manifest: buildBaseManifest({
      appId: APPLICATION_IDENTIFIER,
      roleId: ROLE_IDENTIFIER,
      overrides: {
        connectionProviders: [
          buildProvider({
            universalIdentifier: WORKSPACE_PROVIDER_IDENTIFIER,
            name: 'workspace-provider',
            scope: workspaceProviderScope,
          }),
          buildProvider({
            universalIdentifier: USER_PROVIDER_IDENTIFIER,
            name: 'user-provider',
            scope: 'USER',
          }),
        ],
      },
    }),
  });

  expect(errors).toBeUndefined();
  jest.useRealTimers();
};

describe('app connections outside the provider scope', () => {
  let applicationId: string;
  let providerIdByName: Record<string, string>;
  let tokenExchanges: string[];

  setupHttpMock(
    http.post(TOKEN_ENDPOINT, async ({ request: tokenRequest }) => {
      const { code } = z
        .object({ code: z.string().min(1) })
        .parse(await tokenRequest.json());

      tokenExchanges.push(code);

      return HttpResponse.json({
        access_token: code,
        refresh_token: `refresh-${code}`,
        token_type: 'Bearer',
        scope: 'read',
      });
    }),
  );

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "applicationId" = $1 ORDER BY "createdAt", id',
      [applicationId],
    );

  const insertConnection = async ({
    providerName,
    scope,
  }: {
    providerName: string;
    scope: ConnectedAccountScope;
  }): Promise<string> => {
    const id = v4();

    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        `${providerName}@example.com`,
        ConnectedAccountProvider.APP,
        scope,
        SEED_APPLE_WORKSPACE_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        applicationId,
        providerIdByName[providerName],
      ],
    );

    return id;
  };

  const authorize = async ({
    providerName,
    scope,
    legacyVisibility,
    reconnectingConnectedAccountId,
  }: {
    providerName: string;
    scope?: ConnectedAccountScope;
    legacyVisibility?: 'user' | 'workspace';
    reconnectingConnectedAccountId?: string;
  }): Promise<{ state: string | null; errorMessage: string | null }> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId,
        providerName,
        transientToken: await generateTransientToken(),
        ...(isDefined(scope) ? { scope } : {}),
        ...(isDefined(legacyVisibility)
          ? { visibility: legacyVisibility }
          : {}),
        ...(isDefined(reconnectingConnectedAccountId)
          ? { reconnectingConnectedAccountId }
          : {}),
      });

    expect(response.status).toBe(302);
    const location = new URL(response.headers.location);

    return {
      state: location.searchParams.get('state'),
      errorMessage: location.searchParams.get('errorMessage'),
    };
  };

  const authorizeOrThrow = async (
    args: Parameters<typeof authorize>[0],
  ): Promise<string> => {
    const { state, errorMessage } = await authorize(args);

    expect(errorMessage).toBeNull();
    assertIsDefinedOrThrow(state);

    return state;
  };

  const callback = async (state: string, code: string) => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state, code });

    expect(response.status).toBe(302);
    await waitForAllJobsToFinish();

    return new URL(response.headers.location).searchParams.get('errorMessage');
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'Connection provider scope',
      description: 'Connections outside the provider scope',
      sourcePath: 'connection-provider-scope',
    });
    jest.useRealTimers();

    await syncProviders();

    const providers = await findConnectionProvidersByApplication(
      APPLICATION_IDENTIFIER,
    );

    applicationId = providers[0].applicationId;
    providerIdByName = Object.fromEntries(
      providers.map((provider) => [provider.name, provider.id]),
    );

    const encryption = getAppProviderByClassName<SecretEncryptionService>(
      'SecretEncryptionService',
    );

    for (const key of ['CLIENT_ID', 'CLIENT_SECRET']) {
      await globalThis.testDataSource.query(
        `INSERT INTO core."applicationRegistrationVariable" (key, "encryptedValue", "applicationRegistrationId")
         SELECT $1, $2, "applicationRegistrationId" FROM core.application WHERE id = $3`,
        [
          key,
          encryption.encryptVersioned(
            plaintextStringSchema.parse(`test-${key}`),
          ),
          applicationId,
        ],
      );
    }
  }, 120000);

  beforeEach(() => {
    tokenExchanges = [];
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE "applicationId" = $1',
      [applicationId],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
  });

  it('refuses a new personal connection on a WORKSPACE provider', async () => {
    const { errorMessage } = await authorize({
      providerName: 'workspace-provider',
      scope: 'USER',
    });

    expect(errorMessage).toContain('does not accept USER connections');
  });

  it('creates a workspace connection on a WORKSPACE provider when no scope is given', async () => {
    const errorMessage = await callback(
      await authorizeOrThrow({ providerName: 'workspace-provider' }),
      'workspace-code',
    );

    expect(errorMessage).toBeNull();
    expect(await readAccounts()).toMatchObject([{ scope: 'WORKSPACE' }]);
  });

  it('refuses a new workspace connection on a USER provider', async () => {
    const { errorMessage } = await authorize({
      providerName: 'user-provider',
      scope: 'WORKSPACE',
    });

    expect(errorMessage).toContain('does not accept WORKSPACE connections');
  });

  it('creates a personal connection on a USER provider when no scope is given', async () => {
    const errorMessage = await callback(
      await authorizeOrThrow({ providerName: 'user-provider' }),
      'user-code',
    );

    expect(errorMessage).toBeNull();
    expect(await readAccounts()).toMatchObject([
      {
        scope: 'USER',
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      },
    ]);
  });

  it('reconnects an existing connection whose scope no longer matches the provider scope', async () => {
    const connectedAccountId = await insertConnection({
      providerName: 'user-provider',
      scope: 'WORKSPACE',
    });

    const errorMessage = await callback(
      await authorizeOrThrow({
        providerName: 'user-provider',
        reconnectingConnectedAccountId: connectedAccountId,
      }),
      'reconnect-code',
    );

    expect(errorMessage).toBeNull();
    expect(await readAccounts()).toMatchObject([
      { id: connectedAccountId, scope: 'WORKSPACE' },
    ]);
    expect(tokenExchanges).toEqual(['reconnect-code']);
  });

  it('reconnects an existing personal connection on a WORKSPACE provider', async () => {
    const connectedAccountId = await insertConnection({
      providerName: 'workspace-provider',
      scope: 'USER',
    });

    const errorMessage = await callback(
      await authorizeOrThrow({
        providerName: 'workspace-provider',
        reconnectingConnectedAccountId: connectedAccountId,
      }),
      'personal-reconnect-code',
    );

    expect(errorMessage).toBeNull();
    expect(await readAccounts()).toMatchObject([
      { id: connectedAccountId, scope: 'USER' },
    ]);
    expect(tokenExchanges).toEqual(['personal-reconnect-code']);
  });

  it('refuses to share a personal connection of a USER provider with the workspace', async () => {
    const connectedAccountId = await insertConnection({
      providerName: 'user-provider',
      scope: 'USER',
    });

    const { errorMessage } = await authorize({
      providerName: 'user-provider',
      scope: 'WORKSPACE',
      reconnectingConnectedAccountId: connectedAccountId,
    });

    expect(errorMessage).toContain('does not accept WORKSPACE connections');
    expect(await readAccounts()).toMatchObject([
      { id: connectedAccountId, scope: 'USER' },
    ]);
  });

  it.each([
    {
      providerName: 'workspace-provider',
      legacyVisibility: 'user',
      scope: 'USER',
    },
    {
      providerName: 'user-provider',
      legacyVisibility: 'workspace',
      scope: 'WORKSPACE',
    },
  ] as const)(
    'maps the legacy visibility=$legacyVisibility param to the $scope scope',
    async ({ providerName, legacyVisibility, scope }) => {
      const { errorMessage } = await authorize({
        providerName,
        legacyVisibility,
      });

      expect(errorMessage).toContain(`does not accept ${scope} connections`);
    },
  );

  it('creates a connection from the legacy visibility param', async () => {
    const errorMessage = await callback(
      await authorizeOrThrow({
        providerName: 'workspace-provider',
        legacyVisibility: 'workspace',
      }),
      'legacy-code',
    );

    expect(errorMessage).toBeNull();
    expect(await readAccounts()).toMatchObject([{ scope: 'WORKSPACE' }]);
  });

  it('refuses at the callback when the app changed the provider scope after authorize', async () => {
    const state = await authorizeOrThrow({
      providerName: 'workspace-provider',
    });

    await syncProviders('USER');

    try {
      const errorMessage = await callback(state, 'late-code');

      expect(errorMessage).toContain('does not accept WORKSPACE connections');
      expect(tokenExchanges).toEqual([]);
      expect(await readAccounts()).toEqual([]);
    } finally {
      await syncProviders();
    }
  }, 60000);
});
