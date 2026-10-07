import { gql } from 'graphql-tag';
import request from 'supertest';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ToolCategory } from 'twenty-shared/ai';

const baseUrl = `http://localhost:${APP_PORT}`;

const postMcp = (body: object, bearer: string, path = '/mcp') =>
  request(baseUrl)
    .post(path)
    .set('Authorization', `Bearer ${bearer}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify(body));

const callMcpTool = async (
  bearer: string,
  toolName: string,
  toolArguments: object,
  path = '/mcp',
) => {
  const response = await postMcp(
    {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: toolName, arguments: toolArguments },
      id: '1',
    },
    bearer,
    path,
  ).expect(200);

  return response.body.result as {
    content: { type: string; text: string }[];
    isError: boolean;
  };
};

const getToolCatalog = async (
  bearer: string,
): Promise<Record<string, { name: string; description: string }[]>> => {
  const result = await callMcpTool(bearer, 'get_tool_catalog', {});

  expect(result.isError).toBe(false);

  return JSON.parse(result.content[0].text).catalog;
};

const READ_ONLY_TOOL_NAME_PATTERN = /^(find_|list_|get_|search_)/;

// Dispatch failures come from execute_tool gating or the registry, not the tool itself; their exact wording is
// pinned by the unknown-tools control test below, so drift fails loudly
const DISPATCH_FAILURE_MESSAGE_PATTERN =
  /^Tool ".+" (not found|is not available)$/;

const isDispatchFailure = (result: {
  content: { type: string; text: string }[];
}): boolean => {
  let output: { success?: boolean; message?: string };

  try {
    output = JSON.parse(result.content[0].text);
  } catch {
    return false;
  }

  return (
    output.success === false &&
    DISPATCH_FAILURE_MESSAGE_PATTERN.test(output.message ?? '')
  );
};

// Adding a category here must be a conscious decision, not silent drift
const EXPECTED_CATEGORIES_WITHOUT_READ_ONLY_TOOLS: string[] = [];

const listMcpTools = async (
  bearer: string,
  path: string,
): Promise<
  {
    name: string;
    inputSchema: { type?: string };
    annotations?: {
      readOnlyHint: boolean;
      openWorldHint: boolean;
      destructiveHint: boolean;
    };
  }[]
> => {
  const response = await postMcp(
    { jsonrpc: '2.0', method: 'tools/list', id: '1' },
    bearer,
    path,
  ).expect(200);

  return response.body.result.tools;
};

const META_MODE_TOOL_NAMES = [
  'execute_tool',
  'get_tool_catalog',
  'learn_tools',
  'list_object_metadata_names',
  'list_skills',
  'load_skills',
  'search_help_center',
];

const DIRECT_MODE_PATH = '/mcp?mode=direct';

const createApiKeyToken = async (roleId: string): Promise<string> => {
  const createResponse = await makeMetadataApiRequest({
    query: gql`
      mutation CreateApiKey($input: CreateApiKeyInput!) {
        createApiKey(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        name: `MCP catalog test key ${roleId}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        roleId,
      },
    },
  });

  const apiKeyId = createResponse.body.data?.createApiKey?.id;

  jestExpectToBeDefined(apiKeyId);
  createdApiKeyIds.push(apiKeyId);

  const tokenResponse = await generateApiKeyToken({
    apiKeyId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  const token = tokenResponse.body.data?.generateApiKeyToken?.token;

  jestExpectToBeDefined(token);

  return token;
};

const createdApiKeyIds: string[] = [];

describe('MCP tool catalog (integration)', () => {
  let adminApiKeyToken: string;
  let restrictedApiKeyToken: string;
  let restrictedRoleId: string;

  beforeAll(async () => {
    const rolesResponse = await makeMetadataApiRequest({
      query: gql`
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    });

    const adminRoleId = rolesResponse.body.data?.getRoles?.find(
      (role: { label: string }) => role.label === 'Admin',
    )?.id;

    jestExpectToBeDefined(adminRoleId);

    const { data: restrictedRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'MCP Catalog Restricted Role',
        description: 'API-key role without settings permissions',
        icon: 'IconKey',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
      },
    });

    restrictedRoleId = restrictedRoleData?.createOneRole?.id as string;
    jestExpectToBeDefined(restrictedRoleId);

    adminApiKeyToken = await createApiKeyToken(adminRoleId);
    restrictedApiKeyToken = await createApiKeyToken(restrictedRoleId);
  });

  afterAll(async () => {
    for (const apiKeyId of createdApiKeyIds) {
      await testDataSource
        .query('DELETE FROM core."apiKey" WHERE id = $1', [apiKeyId])
        .catch(() => {});
    }

    if (restrictedRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: restrictedRoleId },
      });
    }
  });

  describe('catalog contract', () => {
    it('should dispatch one read-only tool per advertised category through execute_tool', async () => {
      const catalog = await getToolCatalog(adminApiKeyToken);
      const categories = Object.keys(catalog);

      expect(categories.length).toBeGreaterThan(0);

      const categoriesWithoutReadOnlyTool: string[] = [];

      for (const category of categories) {
        const readOnlyCandidates = catalog[category]
          .filter((tool) => READ_ONLY_TOOL_NAME_PATTERN.test(tool.name))
          .slice(0, 3);

        if (readOnlyCandidates.length === 0) {
          // A write-only category has nothing safe to dispatch in CI
          categoriesWithoutReadOnlyTool.push(category);
          continue;
        }

        let dispatched = false;

        for (const candidate of readOnlyCandidates) {
          const result = await callMcpTool(adminApiKeyToken, 'execute_tool', {
            toolName: candidate.name,
            arguments: {},
          });

          // A tool may return a structured failure on empty arguments; only a dispatch failure means it is unwired
          if (!isDispatchFailure(result)) {
            dispatched = true;
            break;
          }
        }

        expect({ category, dispatched }).toEqual({
          category,
          dispatched: true,
        });
      }

      // Exact equality so gaining or losing a skipped category forces updating the exception list
      expect([...categoriesWithoutReadOnlyTool].sort()).toEqual(
        EXPECTED_CATEGORIES_WITHOUT_READ_ONLY_TOOLS,
      );
    });

    it('should report unknown tools as dispatch failures', async () => {
      const result = await callMcpTool(adminApiKeyToken, 'execute_tool', {
        toolName: 'definitely_not_a_registered_tool',
        arguments: {},
      });

      expect(result.isError).toBe(true);
      expect(isDispatchFailure(result)).toBe(true);
    });
  });

  describe('permission gating', () => {
    it('should expose role tools to an admin-bound API key', async () => {
      const catalog = await getToolCatalog(adminApiKeyToken);

      jestExpectToBeDefined(catalog[ToolCategory.ROLE]);

      const roleToolNames = catalog[ToolCategory.ROLE].map((tool) => tool.name);

      expect(roleToolNames).toEqual(
        expect.arrayContaining(['list_roles', 'create_role', 'update_role']),
      );
    });

    it('should hide role tools from an API key without settings permissions', async () => {
      const catalog = await getToolCatalog(restrictedApiKeyToken);

      expect(catalog[ToolCategory.ROLE]).toBeUndefined();

      const allToolNames = Object.values(catalog)
        .flat()
        .map((tool) => tool.name);

      expect(allToolNames).not.toEqual(expect.arrayContaining(['create_role']));

      // Proves the empty ROLE category is gating rather than a broken catalog
      expect(catalog[ToolCategory.DATABASE_CRUD]?.length).toBeGreaterThan(0);
    });
  });

  describe('direct mode', () => {
    it('should list registry tools directly, without the meta-tools or MCP-excluded tools', async () => {
      const toolNames = (
        await listMcpTools(adminApiKeyToken, DIRECT_MODE_PATH)
      ).map((tool) => tool.name);

      expect(toolNames).toEqual(
        expect.arrayContaining([
          'find_many_companies',
          'search_help_center',
          'load_skills',
        ]),
      );

      for (const hiddenToolName of [
        'get_tool_catalog',
        'learn_tools',
        'execute_tool',
        'http_request',
      ]) {
        expect(toolNames).not.toContain(hiddenToolName);
      }
    });

    it('should declare an object root on every input schema', async () => {
      const tools = await listMcpTools(adminApiKeyToken, DIRECT_MODE_PATH);

      const toolsWithoutObjectRoot = tools
        .filter((tool) => tool.inputSchema.type !== 'object')
        .map((tool) => tool.name);

      expect(toolsWithoutObjectRoot).toEqual([]);
    });

    it('should call a listed tool by name', async () => {
      const result = await callMcpTool(
        adminApiKeyToken,
        'find_many_companies',
        { limit: 1, select: ['id'] },
        DIRECT_MODE_PATH,
      );

      expect(result.isError).toBe(false);
    });

    it('should refuse MCP-excluded tools called by name', async () => {
      const result = await callMcpTool(
        adminApiKeyToken,
        'http_request',
        {},
        DIRECT_MODE_PATH,
      );

      expect(result.isError).toBe(true);
      expect(isDispatchFailure(result)).toBe(true);
    });

    it('should mark read tools read-only and keep execute hints on writes', async () => {
      const annotationsByToolName = Object.fromEntries(
        (await listMcpTools(adminApiKeyToken, DIRECT_MODE_PATH)).map((tool) => [
          tool.name,
          tool.annotations,
        ]),
      );

      expect(annotationsByToolName.find_many_people).toEqual({
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      });
      expect(annotationsByToolName.create_one_person).toEqual({
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: false,
      });
      expect(annotationsByToolName.get_object_metadata).toEqual({
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      });
      expect(annotationsByToolName.create_many_field_metadata).toEqual({
        readOnlyHint: false,
        openWorldHint: true,
        destructiveHint: false,
      });
    });

    it('should keep plain /mcp on the meta-tools', async () => {
      const toolNames = (await listMcpTools(adminApiKeyToken, '/mcp')).map(
        (tool) => tool.name,
      );

      expect([...toolNames].sort()).toEqual(META_MODE_TOOL_NAMES);

      const response = await postMcp(
        {
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'find_many_companies',
            arguments: { limit: 1, select: ['id'] },
          },
          id: '1',
        },
        adminApiKeyToken,
      ).expect(200);

      expect(response.body.error?.message).toBe(
        'Unknown tool: find_many_companies',
      );
    });
  });
});
