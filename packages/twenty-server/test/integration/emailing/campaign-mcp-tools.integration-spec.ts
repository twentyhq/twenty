import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const MESSAGE_CAMPAIGN_TABLE = `${WORKSPACE_SCHEMA}."messageCampaign"`;
const MESSAGE_LIST_TABLE = `${WORKSPACE_SCHEMA}."messageList"`;
const MESSAGE_LIST_MEMBER_TABLE = `${WORKSPACE_SCHEMA}."messageListMember"`;
const MESSAGE_SUPPRESSION_TABLE = `${WORKSPACE_SCHEMA}."messageSuppression"`;
const PERSON_TABLE = `${WORKSPACE_SCHEMA}."person"`;

const SENDABLE_BODY_TEMPLATE = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
});

describe('Campaign lifecycle tools through MCP (integration)', () => {
  const domain = `${v4()}.example.com`;
  const listId = v4();
  const personId = v4();
  const memberId = v4();
  const campaignId = v4();
  const suppressionId = v4();
  const suppressedEmailAddress = `mcp-suppressed-${v4()}@example.com`;
  let wasMessageCampaignEnabled: boolean;

  const readCampaignStatus = async (): Promise<string> => {
    const [{ status }] = await testDataSource.query(
      `SELECT "status" FROM ${MESSAGE_CAMPAIGN_TABLE} WHERE "id" = $1`,
      [campaignId],
    );

    return status;
  };

  beforeAll(async () => {
    wasMessageCampaignEnabled =
      await getAppProviderByClassName<FeatureFlagService>(
        'FeatureFlagService',
      ).isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
        SEED_APPLE_WORKSPACE_ID,
      );

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: true,
      expectToFail: false,
    });

    await testDataSource.query(
      `INSERT INTO "core"."emailingDomain"
         ("workspaceId", "domain", "status", "verifiedAt", "unsubscribeHostname", "unsubscribeHostnameStatus")
       VALUES ($1, $2, 'VERIFIED', now(), $3, 'ACTIVE')`,
      [SEED_APPLE_WORKSPACE_ID, domain, `unsubscribe.${domain}`],
    );

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_LIST_TABLE} ("id", "name") VALUES ($1, 'MCP tools list')`,
      [listId],
    );

    await testDataSource.query(
      `INSERT INTO ${PERSON_TABLE} ("id", "emailsPrimaryEmail") VALUES ($1, $2)`,
      [personId, `mcp-tools-${personId}@example.com`],
    );

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_LIST_MEMBER_TABLE} ("id", "listId", "personId")
       VALUES ($1, $2, $3)`,
      [memberId, listId, personId],
    );

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_CAMPAIGN_TABLE}
         ("id", "name", "status", "subject", "bodyTemplate", "fromAddressPrimaryEmail", "listId")
       VALUES ($1, 'MCP tools campaign', 'DRAFT', 'Monthly newsletter', $2, $3, $4)`,
      [campaignId, SENDABLE_BODY_TEMPLATE, `campaigns@${domain}`, listId],
    );

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_SUPPRESSION_TABLE} ("id", "emailAddress", "reason", "source")
       VALUES ($1, $2, 'UNSUBSCRIBE', 'SYSTEM')`,
      [suppressionId, suppressedEmailAddress],
    );
  });

  afterAll(async () => {
    await testDataSource.query(
      `DELETE FROM ${MESSAGE_SUPPRESSION_TABLE} WHERE "id" = $1`,
      [suppressionId],
    );
    await testDataSource.query(
      `DELETE FROM ${MESSAGE_CAMPAIGN_TABLE} WHERE "id" = $1`,
      [campaignId],
    );
    await testDataSource.query(
      `DELETE FROM ${MESSAGE_LIST_MEMBER_TABLE} WHERE "id" = $1`,
      [memberId],
    );
    await testDataSource.query(`DELETE FROM ${PERSON_TABLE} WHERE "id" = $1`, [
      personId,
    ]);
    await testDataSource.query(
      `DELETE FROM ${MESSAGE_LIST_TABLE} WHERE "id" = $1`,
      [listId],
    );
    await testDataSource.query(
      `DELETE FROM "core"."emailingDomain" WHERE "domain" = $1`,
      [domain],
    );

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: wasMessageCampaignEnabled,
      expectToFail: false,
    });
  });

  it('should preview the audience of a ready campaign', async () => {
    const output = await executeToolThroughMcp<{
      audience: { totalMembers: number; sendable: number };
      blockers: unknown[];
    }>({
      toolName: 'preview_campaign_send',
      toolArguments: { campaignId },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.success).toBe(true);
    expect(output.result).toMatchObject({
      audience: { totalMembers: 1, sendable: 1 },
      blockers: [],
    });
  });

  it('should refuse to send when the approved recipient count no longer matches', async () => {
    const output = await executeToolThroughMcp({
      toolName: 'send_campaign',
      toolArguments: { campaignId, expectedRecipientCount: 2 },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.success).toBe(false);
    expect(output.error).toContain('would now reach 1 recipient(s)');
    expect(await readCampaignStatus()).toBe('DRAFT');
  });

  it('should find a suppressed address', async () => {
    const output = await executeToolThroughMcp<{
      totalCount: number;
      suppressions: { emailAddress: string; reason: string }[];
    }>({
      toolName: 'find_campaign_suppressions',
      toolArguments: { searchTerm: suppressedEmailAddress },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.success).toBe(true);
    expect(output.result?.suppressions).toEqual([
      expect.objectContaining({
        emailAddress: suppressedEmailAddress,
        reason: 'UNSUBSCRIBE',
      }),
    ]);
  });

  it('should not let a member without the workspace settings permission send', async () => {
    const output = await executeToolThroughMcp({
      toolName: 'send_campaign',
      toolArguments: { campaignId, expectedRecipientCount: 2 },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(output).toMatchObject({
      success: false,
      message: 'Tool "send_campaign" not found',
    });
    expect(await readCampaignStatus()).toBe('DRAFT');
  });
});
