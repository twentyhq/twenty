import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

const previewCampaignSendInputSchema = z.object({
  campaignId: z.uuid().describe('The UUID of the messageCampaign record.'),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .describe(
      'ISO 8601 date-time to check a scheduled send for. Omit to check an immediate send.',
    ),
});

@DefineTool({
  name: 'preview_campaign_send',
  category: ToolCategory.ACTION,
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
  description:
    'Check whether an email campaign can be sent, without sending anything. ' +
    'Returns the audience: list members, how many are sendable, and how many are skipped and why (no email, duplicate email, suppressed, globally or topic unsubscribed, tracking refused). ' +
    'Also returns blockers that would stop the send, such as an unverified sending domain, a missing subject or no sendable recipient. ' +
    'Call this before send_campaign and show the person the sendable count.',
})
export class PreviewCampaignSendTool extends BaseTool<
  typeof previewCampaignSendInputSchema
> {
  readonly inputSchema = previewCampaignSendInputSchema;

  constructor(
    private readonly messageCampaignService: MessageCampaignService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {
    super();
  }

  async execute({
    input: { campaignId, scheduledAt },
    context: { workspaceId, userWorkspaceId, locale },
  }: ToolExecuteArgs<
    typeof previewCampaignSendInputSchema
  >): Promise<ToolOutput> {
    if (!isDefined(userWorkspaceId)) {
      return {
        success: false,
        message: 'Failed to preview campaign send',
        error: 'This tool can only run on behalf of a workspace member',
      };
    }

    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const preview = await this.messageCampaignService.previewSend({
      workspaceId,
      userWorkspaceId,
      campaignId,
      scheduledAt: isDefined(scheduledAt) ? new Date(scheduledAt) : undefined,
      locale,
    });

    return {
      success: true,
      message:
        preview.blockers.length > 0
          ? `Campaign cannot be sent: ${preview.blockers.map(({ message }) => message).join(' ')}`
          : `Campaign can be sent to ${preview.audience?.sendable ?? 0} recipient(s)`,
      result: preview,
    };
  }
}
