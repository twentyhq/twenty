import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type MessageCampaignDraftService } from 'src/modules/emailing/services/message-campaign-draft.service';
import { SaveCampaignToolInputZodSchema } from 'src/modules/emailing/tools/save-campaign-tool.schema';

const MESSAGE_CAMPAIGN_TABLE = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."messageCampaign"`;

const buildBodyWithVariables = (variables: string[]) => ({
  type: 'doc' as const,
  content: [
    {
      type: 'paragraph' as const,
      content: [
        { type: 'text' as const, text: 'Hi ' },
        ...variables.map((variable) => ({
          type: 'variableTag' as const,
          attrs: { variable },
        })),
      ],
    },
  ],
});

const saveDraftWithVariables = (...variables: string[]) =>
  getAppProviderByClassName<MessageCampaignDraftService>(
    'MessageCampaignDraftService',
  ).saveDraft({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    subject: 'Hello',
    body: buildBodyWithVariables(variables),
  });

describe('Saving a campaign draft with variables', () => {
  it('should accept every variable the save_campaign tool advertises', async () => {
    const advertisedVariables =
      SaveCampaignToolInputZodSchema.shape.body.description?.match(
        /\{\{.*?\}\}/g,
      ) ?? [];

    expect(advertisedVariables).toContain('{{name.firstName}}');

    const output = await executeToolThroughMcp<{ campaignId: string }>({
      toolName: 'save_campaign',
      toolArguments: {
        subject: 'Hello',
        body: buildBodyWithVariables(advertisedVariables),
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(output.error).toBeUndefined();
    expect(output.success).toBe(true);

    await testDataSource.query(
      `DELETE FROM ${MESSAGE_CAMPAIGN_TABLE} WHERE "id" = $1`,
      [output.result?.campaignId],
    );
  });

  it('should reject a fallback written without the default filter', async () => {
    await expect(
      saveDraftWithVariables('{{jobTitle | "there"}}'),
    ).rejects.toThrow('Malformed campaign variable: {{jobTitle | "there"}}');
  });

  it('should reject an unknown variable even when it has a fallback', async () => {
    await expect(
      saveDraftWithVariables('{{notAPersonField | default: "there"}}'),
    ).rejects.toThrow('Unknown campaign variables: notAPersonField');
  });
});
