import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { getToolIndex } from 'test/integration/graphql/suites/application-role-intersection/utils/get-tool-index.util';
import { listDirectModeMcpToolNames } from 'test/integration/graphql/suites/application-role-intersection/utils/list-direct-mode-mcp-tool-names.util';
import {
  cleanupDelegatedApplications,
  type DelegatedApplications,
  setupDelegatedApplications,
} from 'test/integration/graphql/suites/application-role-intersection/utils/setup-delegated-applications.util';
import { ToolCategory } from 'twenty-shared/ai';

// The seeded admin holds every settings flag, so a category gated on one the
// application's role lacks can only disappear through the intersection.
const NARROWED_CATEGORIES = [ToolCategory.ROLE, ToolCategory.WEBHOOK];

const WEBHOOK_TOOL_NAMES = [
  'list_webhooks',
  'create_webhook',
  'update_webhook',
  'delete_webhook',
];

const executeListWebhooksThroughMcp = (token: string) =>
  callMcpTool({
    toolName: 'execute_tool',
    toolArguments: { toolName: 'list_webhooks', arguments: {} },
    token,
  });

describe('Tool listings narrow to the delegated application role', () => {
  let delegatedApplications: DelegatedApplications;

  beforeAll(async () => {
    delegatedApplications = await setupDelegatedApplications();
  }, 180000);

  afterAll(async () => {
    await cleanupDelegatedApplications(delegatedApplications);
  }, 120000);

  describe('the MCP tool catalog', () => {
    it.each(NARROWED_CATEGORIES)(
      'should list the settings-gated %s category for the admin session',
      async (category) => {
        const catalog = await getMcpToolCatalog({
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        expect(Object.keys(catalog)).toContain(category);
      },
    );

    it.each(NARROWED_CATEGORIES)(
      'should hide the %s category from an application whose role holds no flag',
      async (category) => {
        const catalog = await getMcpToolCatalog({
          token: delegatedApplications.noFlagApplicationToken,
        });

        expect(Object.keys(catalog)).not.toContain(category);
      },
    );

    it('should hide only the webhook tools from an application whose role holds ROLES but not API_KEYS_AND_WEBHOOKS', async () => {
      const catalog = await getMcpToolCatalog({
        token: delegatedApplications.flaggedApplicationToken,
      });

      expect(Object.keys(catalog)).toContain(ToolCategory.ROLE);
      expect(Object.keys(catalog)).not.toContain(ToolCategory.WEBHOOK);
    });
  });

  describe('the MCP direct-mode tool list', () => {
    it('should list the webhook tools for the admin session', async () => {
      const toolNames = await listDirectModeMcpToolNames({
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(toolNames).toEqual(expect.arrayContaining(WEBHOOK_TOOL_NAMES));
    });

    it.each([
      ['holds no flag', 'noFlagApplicationToken'],
      ['holds ROLES but not API_KEYS_AND_WEBHOOKS', 'flaggedApplicationToken'],
    ] as const)(
      'should hide the webhook tools from an application whose role %s',
      async (_, tokenKey) => {
        const toolNames = await listDirectModeMcpToolNames({
          token: delegatedApplications[tokenKey],
        });

        expect(
          toolNames.filter((toolName) => WEBHOOK_TOOL_NAMES.includes(toolName)),
        ).toEqual([]);
        expect(toolNames.length).toBeGreaterThan(0);
      },
    );
  });

  describe('getToolIndex', () => {
    it.each(NARROWED_CATEGORIES)(
      'should list the settings-gated %s category for the admin session',
      async (category) => {
        const { data } = await getToolIndex({ expectToFail: false });

        expect(data.getToolIndex.map((entry) => entry.category)).toContain(
          category,
        );
      },
    );

    it.each(NARROWED_CATEGORIES)(
      'should hide the %s category from an application whose role holds no flag',
      async (category) => {
        const { data } = await getToolIndex({
          token: delegatedApplications.noFlagApplicationToken,
          expectToFail: false,
        });

        expect(data.getToolIndex.map((entry) => entry.category)).not.toContain(
          category,
        );
        expect(data.getToolIndex.length).toBeGreaterThan(0);
      },
    );
  });

  describe('MCP tool execution', () => {
    it('should run a webhook tool for the admin session', async () => {
      const result = await executeListWebhooksThroughMcp(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(result.isError).toBe(false);
    });

    it('should refuse a webhook tool to an application whose role holds no flag', async () => {
      const result = await executeListWebhooksThroughMcp(
        delegatedApplications.noFlagApplicationToken,
      );

      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text)).toMatchObject({
        success: false,
        message: 'Tool "list_webhooks" not found',
      });
    });
  });
});
