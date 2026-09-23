import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { getToolIndex } from 'test/integration/graphql/suites/application-role-intersection/utils/get-tool-index.util';
import {
  cleanupDelegatedApplications,
  type DelegatedApplications,
  setupDelegatedApplications,
} from 'test/integration/graphql/suites/application-role-intersection/utils/setup-delegated-applications.util';
import { ToolCategory } from 'twenty-shared/ai';

// The seeded admin holds every settings flag, so a category gated on one the
// application's role lacks can only disappear through the intersection.
const NARROWED_CATEGORY = ToolCategory.ROLE;

describe('Tool listings narrow to the delegated application role', () => {
  let delegatedApplications: DelegatedApplications;

  beforeAll(async () => {
    delegatedApplications = await setupDelegatedApplications();
  }, 180000);

  afterAll(async () => {
    await cleanupDelegatedApplications(delegatedApplications);
  }, 120000);

  describe('the MCP tool catalog', () => {
    it('should list the settings-gated category for the admin session', async () => {
      const catalog = await getMcpToolCatalog({
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(Object.keys(catalog)).toContain(NARROWED_CATEGORY);
    });

    it('should hide it from an application whose role holds no flag', async () => {
      const catalog = await getMcpToolCatalog({
        token: delegatedApplications.noFlagApplicationToken,
      });

      expect(Object.keys(catalog)).not.toContain(NARROWED_CATEGORY);
    });
  });

  describe('getToolIndex', () => {
    it('should list the settings-gated category for the admin session', async () => {
      const { data } = await getToolIndex({ expectToFail: false });

      expect(data.getToolIndex.map((entry) => entry.category)).toContain(
        NARROWED_CATEGORY,
      );
    });

    it('should hide it from an application whose role holds no flag', async () => {
      const { data } = await getToolIndex({
        token: delegatedApplications.noFlagApplicationToken,
        expectToFail: false,
      });

      expect(data.getToolIndex.map((entry) => entry.category)).not.toContain(
        NARROWED_CATEGORY,
      );
      expect(data.getToolIndex.length).toBeGreaterThan(0);
    });
  });
});
