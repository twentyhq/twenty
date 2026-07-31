import { gql } from 'graphql-tag';
import request from 'supertest';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ToolCategory } from 'twenty-shared/ai';

/**
 * Contract tests for the MCP tool catalog.
 *
 * 1. Catalog contract: every category advertised by get_tool_catalog must be
 *    dispatchable end to end through execute_tool. Scales automatically: a
 *    newly registered provider is covered the moment it appears in the
 *    catalog, with no new test code.
 * 2. Permission gating: the catalog is role-dependent. An API key bound to a
 *    role without settings permissions must not see settings-gated tools
 *    (e.g. the ROLE category), while an admin-bound key must.
 */

const baseUrl = `http://localhost:${APP_PORT}`;

const postMcp = (body: object, bearer: string) =>
  request(baseUrl)
    .post('/mcp')
    .set('Authorization', `Bearer ${bearer}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify(body));

const callMcpTool = async (
  bearer: string,
  toolName: string,
  toolArguments: object,
) => {
  const response = await postMcp(
    {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name: toolName, arguments: toolArguments },
      id: '1',
    },
    bearer,
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

const createApiKeyToken = async (roleId: string): Promise<string> => {
  const createResponse = await makeMetadataAPIRequest({
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
    const rolesResponse = await makeMetadataAPIRequest({
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
          // Write-only categories (e.g. ACTION) have nothing safe to dispatch
          // in CI; the listing itself already proves the provider registered.
          categoriesWithoutReadOnlyTool.push(category);
          continue;
        }

        let dispatched = false;

        for (const candidate of readOnlyCandidates) {
          const result = await callMcpTool(adminApiKeyToken, 'execute_tool', {
            toolName: candidate.name,
            arguments: {},
          });

          if (!result.isError) {
            dispatched = true;
            break;
          }
        }

        expect({ category, dispatched }).toEqual({
          category,
          dispatched: true,
        });
      }

      // The registry currently ships read-only tools for every category
      // except ACTION; fail loudly if that assumption drifts so the skip
      // list stays deliberate.
      expect(
        categoriesWithoutReadOnlyTool.filter(
          (category) => category !== ToolCategory.ACTION,
        ),
      ).toEqual([]);
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

      // The restricted role still sees record read tools, proving the empty
      // ROLE category is gating rather than a broken catalog.
      expect(catalog[ToolCategory.DATABASE_CRUD]?.length).toBeGreaterThan(0);
    });
  });
});
