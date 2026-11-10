import { createHash } from 'crypto';

import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { v4 } from 'uuid';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const APPLICATION_IDENTIFIER = v4();
const ROLE_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const WORKSPACE_PROVIDER_IDENTIFIER = v4();
const OAUTH_PROVIDER_IDENTIFIER = v4();
const IDENTIFY_ACCOUNT_IDENTIFIER = v4();
const VALID_API_KEY = 'jane:valid';

// Keys look like "<account>:<secret>"; only the "valid" secret is accepted.
const IDENTIFY_ACCOUNT_SOURCE = `export const handler = ({ accessToken }) => {
  const [account, secret] = accessToken.split(':');
  if (secret !== 'valid') throw new Error('401 Unauthorized');
  return { externalAccountId: 'acme-' + account, handle: account + '@acme.com' };
};`;

const CONNECT_WITH_API_KEY_MUTATION = gql`
  mutation ConnectApplicationWithApiKey(
    $input: ConnectApplicationWithApiKeyInput!
  ) {
    connectApplicationWithApiKey(input: $input)
  }
`;

const GET_APP_CONNECTION_QUERY = gql`
  query AppConnection($id: ID!) {
    appConnection(id: $id) {
      id
      providerType
      accessToken
      handle
      externalAccountId
      scope
    }
  }
`;

describe('app connection api key flow', () => {
  let provider: ConnectionProviderEntity;

  const connect = ({
    apiKey,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
    reconnectingConnectedAccountId,
    providerName = provider.name,
  }: {
    apiKey: string;
    token?: string;
    reconnectingConnectedAccountId?: string;
    providerName?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: CONNECT_WITH_API_KEY_MUTATION,
        variables: {
          input: {
            applicationId: provider.applicationId,
            providerName,
            apiKey,
            reconnectingConnectedAccountId,
          },
        },
      },
      token,
    );

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "applicationId" = $1 ORDER BY "createdAt", id',
      [provider.applicationId],
    );

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'API key flow integration',
      description: 'API key connection flow',
      sourcePath: 'api-key-flow-integration',
    });
    jest.useRealTimers();

    const uploaded = await uploadApplicationFile({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/identify-account.mjs',
      filename: 'identify-account.mjs',
      contentType: 'application/javascript',
      fileBuffer: Buffer.from(IDENTIFY_ACCOUNT_SOURCE),
    });

    expect(uploaded.errors).toBeUndefined();

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: ROLE_IDENTIFIER,
        overrides: {
          logicFunctions: [
            {
              universalIdentifier: IDENTIFY_ACCOUNT_IDENTIFIER,
              name: 'identify-account',
              handlerName: 'handler',
              sourceHandlerPath: 'src/identify-account.ts',
              builtHandlerPath: 'dist/identify-account.mjs',
              builtHandlerChecksum: createHash('sha256')
                .update(IDENTIFY_ACCOUNT_SOURCE)
                .digest('hex'),
              timeoutSeconds: 10,
            },
          ],
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'acme',
              displayName: 'Acme',
              type: 'apiKey',
              scope: 'USER',
              identifyAccountLogicFunction: {
                universalIdentifier: IDENTIFY_ACCOUNT_IDENTIFIER,
              },
            },
            {
              universalIdentifier: WORKSPACE_PROVIDER_IDENTIFIER,
              name: 'acme-workspace',
              displayName: 'Acme Workspace',
              type: 'apiKey',
              scope: 'WORKSPACE',
              identifyAccountLogicFunction: {
                universalIdentifier: IDENTIFY_ACCOUNT_IDENTIFIER,
              },
            },
            {
              universalIdentifier: OAUTH_PROVIDER_IDENTIFIER,
              name: 'acme-oauth',
              displayName: 'Acme OAuth',
              type: 'oauth',
              oauth: {
                authorizationEndpoint: 'https://acme.example.com/authorize',
                tokenEndpoint: 'https://acme.example.com/token',
                scopes: [],
                clientIdVariable: 'ACME_CLIENT_ID',
                clientSecretVariable: 'ACME_CLIENT_SECRET',
              },
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();
    [provider] = await globalThis.testDataSource.query(
      'SELECT * FROM core."connectionProvider" WHERE "universalIdentifier" = $1',
      [PROVIDER_IDENTIFIER],
    );
  }, 120000);

  afterEach(async () => {
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE "applicationId" = $1',
      [provider.applicationId],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
  });

  it('stores the provider without any sub-config', () => {
    expect(provider).toMatchObject({
      type: 'apiKey',
      oauthConfig: null,
      customConfig: null,
    });
  });

  it('saves a validated key and exposes it to the app', async () => {
    const response = await connect({ apiKey: `  ${VALID_API_KEY}  ` });

    expect(response.body.errors).toBeUndefined();

    const connectedAccountId = response.body.data.connectApplicationWithApiKey;
    const [account] = await readAccounts();

    expect(account).toMatchObject({
      id: connectedAccountId,
      handle: 'jane@acme.com',
      externalAccountId: 'acme-jane',
      refreshToken: null,
      scope: 'USER',
    });
    expect(account.accessToken).toMatch(/^enc:v2:/);

    const { applicationAccessToken } =
      await generateAppleAdminApplicationTokenPair({
        applicationId: provider.applicationId,
      });

    const connectionResponse = await makeMetadataApiRequest(
      {
        query: GET_APP_CONNECTION_QUERY,
        variables: { id: connectedAccountId },
      },
      applicationAccessToken.token,
    );

    expect(connectionResponse.body.errors).toBeUndefined();
    expect(connectionResponse.body.data.appConnection).toMatchObject({
      providerType: 'apiKey',
      accessToken: VALID_API_KEY,
      handle: 'jane@acme.com',
    });
  });

  it('rejects a key that identifyAccount refuses and saves nothing', async () => {
    const response = await connect({ apiKey: 'jane:wrong' });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors?.[0]?.extensions?.userFriendlyMessage).toBe(
      'The Acme API key was rejected. Check it and try again.',
    );
    expect(await readAccounts()).toEqual([]);
  });

  it('replaces the key in place on reconnect', async () => {
    const first = await connect({ apiKey: VALID_API_KEY });
    const connectedAccountId = first.body.data.connectApplicationWithApiKey;

    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "authFailedAt" = NOW() WHERE id = $1',
      [connectedAccountId],
    );

    const reconnect = await connect({
      apiKey: VALID_API_KEY,
      reconnectingConnectedAccountId: connectedAccountId,
    });

    expect(reconnect.body.errors).toBeUndefined();
    expect(reconnect.body.data.connectApplicationWithApiKey).toBe(
      connectedAccountId,
    );

    const accounts = await readAccounts();

    expect(accounts).toHaveLength(1);
    expect(accounts[0].authFailedAt).toBeNull();
  });

  it('refuses a reconnect with a key for a different account', async () => {
    const first = await connect({ apiKey: VALID_API_KEY });
    const connectedAccountId = first.body.data.connectApplicationWithApiKey;

    const reconnect = await connect({
      apiKey: 'john:valid',
      reconnectingConnectedAccountId: connectedAccountId,
    });

    expect(reconnect.body.errors).toBeDefined();

    const accounts = await readAccounts();

    expect(accounts).toHaveLength(1);
    expect(accounts[0].externalAccountId).toBe('acme-jane');
  });

  it('refuses a blank key', async () => {
    const response = await connect({ apiKey: '   ' });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors?.[0]?.extensions?.userFriendlyMessage).toBe(
      'Enter an API key.',
    );
    expect(await readAccounts()).toEqual([]);
  });

  it('refuses a member without the Applications permission on a workspace provider', async () => {
    const response = await connect({
      apiKey: VALID_API_KEY,
      providerName: 'acme-workspace',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeDefined();
    expect(await readAccounts()).toEqual([]);
  });

  it('refuses application tokens', async () => {
    const { applicationAccessToken } =
      await generateAppleAdminApplicationTokenPair({
        applicationId: provider.applicationId,
      });

    const response = await connect({
      apiKey: VALID_API_KEY,
      token: applicationAccessToken.token,
    });

    expect(response.body.errors).toBeDefined();
    expect(await readAccounts()).toEqual([]);
  });

  it('refuses a provider that is not apiKey-typed', async () => {
    const response = await connect({
      apiKey: VALID_API_KEY,
      providerName: 'acme-oauth',
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors?.[0]?.extensions?.userFriendlyMessage).toBe(
      'Acme OAuth does not accept API keys.',
    );
    expect(await readAccounts()).toEqual([]);
  });

  it('reports an unknown provider as not found', async () => {
    const response = await connect({
      apiKey: VALID_API_KEY,
      providerName: 'missing-provider',
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
  });
});
