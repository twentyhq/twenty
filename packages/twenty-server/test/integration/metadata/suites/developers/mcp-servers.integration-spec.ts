import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  createMcpServer,
  deleteMcpServer,
  getMcpServer,
  getMcpServers,
  updateMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const VALID_INPUT = {
  name: 'docs',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
};

describe('mcpServersResolver (e2e)', () => {
  const createdMcpServerIds: string[] = [];

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterEach(async () => {
    for (const id of createdMcpServerIds.splice(0)) {
      await deleteMcpServer(id).catch(() => {});
    }
  });

  const createAndTrack = async (
    input: Partial<typeof VALID_INPUT> & {
      authorizationHeaderValue?: string | null;
      isEnabled?: boolean;
    } = {},
  ) => {
    const response = await createMcpServer({ ...VALID_INPUT, ...input });

    if (response.body.data?.createMcpServer?.id) {
      createdMcpServerIds.push(response.body.data.createMcpServer.id);
    }

    return response;
  };

  describe('createMcpServer', () => {
    it('creates an enabled server without an authorization header', async () => {
      const response = await createAndTrack();

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createMcpServer).toMatchObject({
        ...VALID_INPUT,
        hasAuthorizationHeader: false,
        isEnabled: true,
      });
    });

    it('never exposes the authorization header value', async () => {
      const response = await createAndTrack({
        authorizationHeaderValue: 'Bearer super-secret-token',
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createMcpServer.hasAuthorizationHeader).toBe(
        true,
      );
      expect(JSON.stringify(response.body)).not.toContain('super-secret-token');
    });

    it.each([
      ['Docs', 'uppercase'],
      ['1docs', 'leading digit'],
      ['my-docs', 'dash'],
      ['a'.repeat(33), 'too long'],
    ])('rejects name "%s" (%s)', async (name) => {
      const response = await createAndTrack({ name });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeNull();
    });

    it('rejects a non-http URL', async () => {
      const response = await createAndTrack({ url: 'ftp://docs.example.com' });

      expect(response.body.errors).toBeDefined();
    });

    it('rejects a duplicate name in the workspace', async () => {
      await createAndTrack();

      const response = await createAndTrack({ label: 'Docs again' });

      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeNull();
    });
  });

  describe('mcpServers and mcpServer queries', () => {
    it('lists and fetches created servers', async () => {
      const created = (await createAndTrack()).body.data.createMcpServer;

      const listResponse = await getMcpServers();

      expect(listResponse.body.errors).toBeUndefined();
      expect(
        listResponse.body.data.mcpServers.map(({ id }: { id: string }) => id),
      ).toContain(created.id);

      const getResponse = await getMcpServer(created.id);

      expect(getResponse.body.data.mcpServer).toMatchObject(VALID_INPUT);
    });
  });

  describe('updateMcpServer', () => {
    it('updates editable fields and clears the authorization header', async () => {
      const created = (
        await createAndTrack({ authorizationHeaderValue: 'Bearer abc' })
      ).body.data.createMcpServer;

      const response = await updateMcpServer({
        id: created.id,
        update: {
          label: 'Renamed',
          isEnabled: false,
          authorizationHeaderValue: null,
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMcpServer).toMatchObject({
        id: created.id,
        label: 'Renamed',
        isEnabled: false,
        hasAuthorizationHeader: false,
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

      expect(response.body.errors).toBeDefined();
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
