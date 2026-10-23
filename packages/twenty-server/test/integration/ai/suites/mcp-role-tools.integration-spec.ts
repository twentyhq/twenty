import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { findObjectMetadataIdByName } from 'test/integration/graphql/suites/application-role-intersection/utils/find-object-metadata-id-by-name.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ToolCategory } from 'twenty-shared/ai';

const ROLE_TOOL_NAMES = [
  'list_roles',
  'create_role',
  'update_role',
  'delete_role',
  'assign_role_to_workspace_member',
  'upsert_object_permissions',
  'upsert_row_level_permission_rules',
];

const ROLE_LABEL = 'MCP role tools integration role';
const RENAMED_ROLE_LABEL = `${ROLE_LABEL} renamed`;

type RoleSummary = { id: string; label: string };

const listRolesThroughMcp = async (): Promise<RoleSummary[]> => {
  const output = await executeToolThroughMcp<{ roles: RoleSummary[] }>({
    toolName: 'list_roles',
    toolArguments: {},
  });

  expect(output.success).toBe(true);

  return output.result?.roles ?? [];
};

describe('MCP role tools (integration)', () => {
  afterAll(async () => {
    const leakedRoles = (await listRolesThroughMcp()).filter(({ label }) =>
      label.startsWith(ROLE_LABEL),
    );

    for (const { id } of leakedRoles) {
      await executeToolThroughMcp({
        toolName: 'delete_role',
        toolArguments: { roleId: id },
      });
    }
  });

  it('should describe the role tools to the model', async () => {
    const result = await callMcpTool({
      toolName: 'learn_tools',
      toolArguments: { toolNames: ROLE_TOOL_NAMES },
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(result.isError).toBe(false);

    const payload = JSON.parse(result.content[0].text);

    expect(payload.notFound).toEqual([]);
    expect(payload.tools).toMatchSnapshot();
  });

  it('should create, restrict, rename and delete a role', async () => {
    const created = await executeToolThroughMcp<RoleSummary>({
      toolName: 'create_role',
      toolArguments: { label: ROLE_LABEL, canReadAllObjectRecords: true },
    });

    expect(created).toMatchObject({
      success: true,
      message: `Role "${ROLE_LABEL}" created`,
      result: { label: ROLE_LABEL, canReadAllObjectRecords: true },
    });

    const roleId = created.result?.id;

    jestExpectToBeDefined(roleId);
    expect((await listRolesThroughMcp()).map(({ id }) => id)).toContain(roleId);

    const companyObjectMetadataId = await findObjectMetadataIdByName('company');
    const companyReadOnlyPermission = {
      objectMetadataId: companyObjectMetadataId,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    };

    const restricted = await executeToolThroughMcp({
      toolName: 'upsert_object_permissions',
      toolArguments: { roleId, objectPermissions: [companyReadOnlyPermission] },
    });

    expect(restricted).toMatchObject({
      success: true,
      message: 'Object permissions updated',
      result: { roleId, objectPermissions: [companyReadOnlyPermission] },
    });

    const renamed = await executeToolThroughMcp<RoleSummary>({
      toolName: 'update_role',
      toolArguments: { roleId, update: { label: RENAMED_ROLE_LABEL } },
    });

    expect(renamed).toMatchObject({
      success: true,
      message: `Role "${RENAMED_ROLE_LABEL}" updated`,
      result: { id: roleId, label: RENAMED_ROLE_LABEL },
    });

    const deleted = await executeToolThroughMcp({
      toolName: 'delete_role',
      toolArguments: { roleId },
    });

    expect(deleted).toEqual({
      success: true,
      message: `Role "${RENAMED_ROLE_LABEL}" deleted`,
      result: { id: roleId, label: RENAMED_ROLE_LABEL },
    });
    expect((await listRolesThroughMcp()).map(({ id }) => id)).not.toContain(
      roleId,
    );
  });

  it('should refuse row-level rules on a non-editable role', async () => {
    const adminRole = (await listRolesThroughMcp()).find(
      ({ label }) => label === 'Admin',
    );

    jestExpectToBeDefined(adminRole);

    const refused = await executeToolThroughMcp({
      toolName: 'upsert_row_level_permission_rules',
      toolArguments: {
        roleId: adminRole.id,
        objectMetadataId: await findObjectMetadataIdByName('company'),
        predicates: [],
        predicateGroups: [{ logicalOperator: 'AND' }],
      },
    });

    expect(refused).toMatchObject({
      success: false,
      error: expect.stringContaining('Role is not editable'),
    });

    const rolesWithRules = await executeToolThroughMcp<{
      roles: (RoleSummary & {
        rowLevelPermissionPredicateGroups: unknown[];
      })[];
    }>({
      toolName: 'list_roles',
      toolArguments: { includeRowLevelPermissionRules: true },
    });

    expect(
      rolesWithRules.result?.roles.find(({ id }) => id === adminRole.id)
        ?.rowLevelPermissionPredicateGroups,
    ).toEqual([]);
  });

  // The seeded member role holds no settings flag, so it lacks ROLES
  describe('for a member without ROLES', () => {
    it('should hide the role category from the catalog', async () => {
      const catalog = await getMcpToolCatalog({
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(Object.keys(catalog)).not.toContain(ToolCategory.ROLE);
    });

    it.each(ROLE_TOOL_NAMES)('should refuse %s', async (toolName) => {
      const result = await callMcpTool({
        toolName: 'execute_tool',
        toolArguments: { toolName, arguments: {} },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        success: false,
        message: `Tool "${toolName}" not found`,
      });
    });
  });
});
