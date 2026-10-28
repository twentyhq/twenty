import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  createMcpServer,
  deleteMcpServer,
  getMcpServer,
  updateMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const VALID_INPUT = {
  name: 'docs',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
};

const getMcpServerValidationErrorCodes = (responseBody: {
  errors?: {
    extensions?: {
      errors?: { mcpServer?: { errors: { code: string }[] }[] };
    };
  }[];
}): string[] =>
  (responseBody.errors ?? []).flatMap((error) =>
    (error.extensions?.errors?.mcpServer ?? []).flatMap((failedValidation) =>
      failedValidation.errors.map(({ code }) => code),
    ),
  );

const OTHER_APPLICATION_IDENTIFIER = uuidv4();
const OTHER_APPLICATION_ROLE_IDENTIFIER = uuidv4();
const OTHER_APPLICATION_PROVIDER_IDENTIFIER = uuidv4();

describe('mcpServersResolver (e2e)', () => {
  const createdMcpServerIds: string[] = [];
  let otherApplicationConnectionProviderId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      value: true,
      expectToFail: false,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: OTHER_APPLICATION_IDENTIFIER,
      name: 'MCP server provider check',
      description: 'Owns a connection provider the MCP server must not use',
      sourcePath: 'mcp-server-provider-check',
    });

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: OTHER_APPLICATION_IDENTIFIER,
        roleId: OTHER_APPLICATION_ROLE_IDENTIFIER,
        overrides: {
          connectionProviders: [
            {
              universalIdentifier: OTHER_APPLICATION_PROVIDER_IDENTIFIER,
              name: 'other-provider',
              displayName: 'Other provider',
              type: 'oauth',
              oauth: {
                authorizationEndpoint: 'https://other.example.com/authorize',
                tokenEndpoint: 'https://other.example.com/token',
                scopes: ['read'],
                clientIdVariable: 'CLIENT_ID',
                clientSecretVariable: 'CLIENT_SECRET',
              },
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();

    const [provider] = await findConnectionProvidersByApplication(
      OTHER_APPLICATION_IDENTIFIER,
    );

    otherApplicationConnectionProviderId = provider.id;
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OTHER_APPLICATION_IDENTIFIER,
    });
  });

  afterEach(async () => {
    for (const id of createdMcpServerIds.splice(0)) {
      await deleteMcpServer(id);
    }
  });

  const createAndTrack = async (
    input: Partial<typeof VALID_INPUT> & {
      connectionProviderId?: string | null;
      isActive?: boolean;
    } = {},
  ) => {
    const response = await createMcpServer({ ...VALID_INPUT, ...input });

    const createdId = response.body.data?.createMcpServer?.id;

    if (isDefined(createdId)) {
      createdMcpServerIds.push(createdId);
    }

    return response;
  };

  describe('createMcpServer', () => {
    it('creates an active public server by default', async () => {
      const response = await createAndTrack();

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createMcpServer).toMatchObject({
        ...VALID_INPUT,
        connectionProviderId: null,
        isActive: true,
      });
    });

    it('rejects an unknown connection provider', async () => {
      const response = await createAndTrack({ connectionProviderId: uuidv4() });

      expect(getMcpServerValidationErrorCodes(response.body)).toEqual([
        'CONNECTION_PROVIDER_NOT_FOUND',
      ]);
      expect(response.body.data).toBeNull();
    });

    it('rejects a connection provider of another application', async () => {
      const response = await createAndTrack({
        connectionProviderId: otherApplicationConnectionProviderId,
      });

      expect(getMcpServerValidationErrorCodes(response.body)).toEqual([
        'CONNECTION_PROVIDER_NOT_IN_APPLICATION',
      ]);
      expect(response.body.data).toBeNull();
    });

    it.each([
      ['my-docs', 'dash'],
      ['a'.repeat(33), 'too long'],
    ])('rejects name "%s" (%s)', async (name) => {
      const response = await createAndTrack({ name });

      expect(getMcpServerValidationErrorCodes(response.body)).toEqual([
        'INVALID_MCP_SERVER_NAME',
      ]);
      expect(response.body.data).toBeNull();
    });

    it('rejects a non-http URL', async () => {
      const response = await createAndTrack({ url: 'ftp://docs.example.com' });

      expect(getMcpServerValidationErrorCodes(response.body)).toEqual([
        'INVALID_MCP_SERVER_URL',
      ]);
    });

    it('rejects a blank label', async () => {
      const response = await createAndTrack({ label: '   ' });

      expect(getMcpServerValidationErrorCodes(response.body)).toEqual([
        'INVALID_MCP_SERVER_INPUT',
      ]);
    });

    it('rejects a duplicate name in the workspace', async () => {
      await createAndTrack();

      const response = await createAndTrack({ label: 'Docs again' });

      expect(getMcpServerValidationErrorCodes(response.body)).toEqual([
        'MCP_SERVER_NAME_ALREADY_EXISTS',
      ]);
      expect(response.body.data).toBeNull();
    });
  });

  describe('updateMcpServer', () => {
    it('updates editable fields', async () => {
      const created = (await createAndTrack()).body.data.createMcpServer;

      const response = await updateMcpServer({
        id: created.id,
        update: { label: 'Renamed', isActive: false },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMcpServer).toMatchObject({
        id: created.id,
        label: 'Renamed',
        isActive: false,
      });
    });

    it('rejects renaming to an existing name', async () => {
      await createAndTrack();
      const other = (await createAndTrack({ name: 'other' })).body.data
        .createMcpServer;

      const response = await updateMcpServer({
        id: other.id,
        update: { name: 'docs' },
      });

      expect(getMcpServerValidationErrorCodes(response.body)).toEqual([
        'MCP_SERVER_NAME_ALREADY_EXISTS',
      ]);
    });

    it('rejects an unknown id', async () => {
      const response = await updateMcpServer({
        id: '20202020-0000-4000-8000-000000000000',
        update: { label: 'Missing' },
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    });
  });

  describe('deleteMcpServer', () => {
    it('deletes and then returns null on fetch', async () => {
      const created = (await createAndTrack()).body.data.createMcpServer;

      const deleteResponse = await deleteMcpServer(created.id);

      expect(deleteResponse.body.errors).toBeUndefined();
      expect(deleteResponse.body.data.deleteMcpServer.id).toBe(created.id);

      const getResponse = await getMcpServer(created.id);

      expect(getResponse.body.data.mcpServer).toBeNull();
    });
  });
});
