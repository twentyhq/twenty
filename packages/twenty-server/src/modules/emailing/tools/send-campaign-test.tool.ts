import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { SEND_CAMPAIGN_TEST_TOOL_NAME } from 'src/modules/emailing/constants/send-campaign-test-tool-name.constant';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

const sendCampaignTestInputSchema = z.object({
  campaignId: z.uuid().describe('The UUID of the messageCampaign record.'),
  toAddress: z
    .email()
    .describe('The single address that receives the test email.'),
});

@DefineTool({
  name: SEND_CAMPAIGN_TEST_TOOL_NAME,
  category: ToolCategory.ACTION,
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
  requiredFeatureFlags: [FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED],
  description:
    'Send one test email of a saved campaign to a single address, from the campaign sender. ' +
    'Variables render with empty values or their fallbacks, since the test is not tied to a person. ' +
    'The campaign status and statistics are not changed. Limited to a few test sends per workspace per day.',
})
export class SendCampaignTestTool extends BaseTool<
  typeof sendCampaignTestInputSchema
> {
  readonly inputSchema = sendCampaignTestInputSchema;

  constructor(
    private readonly messageCampaignService: MessageCampaignService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {
    super();
  }

  async execute({
    input: { campaignId, toAddress },
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof sendCampaignTestInputSchema>): Promise<ToolOutput> {
    if (!isDefined(userWorkspaceId)) {
      return {
        success: false,
        message: 'Failed to send campaign test',
        error: 'This tool can only run on behalf of a workspace member',
      };
    }

    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const { messageId } = await this.messageCampaignService.sendCampaignTest({
      workspaceId,
      userWorkspaceId,
      campaignId,
      toAddress,
    });

    return {
      success: true,
      message: `Test email sent to ${toAddress}`,
      result: { messageId },
    };
  }
}
