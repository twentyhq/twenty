import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey, MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { MessageCampaignScheduleService } from 'src/modules/emailing/services/message-campaign-schedule.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

const sendCampaignInputSchema = z.object({
  campaignId: z.uuid().describe('The UUID of the messageCampaign record.'),
  scheduledAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .describe(
      'ISO 8601 date-time in the future to schedule the send for. Omit to send now.',
    ),
  expectedRecipientCount: z
    .number()
    .int()
    .min(1)
    .describe(
      'The sendable count from preview_campaign_send that the person approved. The send is refused if the audience no longer matches it.',
    ),
});

@DefineTool({
  name: 'send_campaign',
  category: ToolCategory.ACTION,
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
  requiredFeatureFlags: [FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED],
  description:
    'Send an email campaign to its list now, or schedule it. This emails real people and cannot be undone once sending starts. ' +
    'Only call it after the person explicitly asked to send this campaign and approved the recipient count from preview_campaign_send. ' +
    'Unsubscribed and suppressed recipients are always skipped. ' +
    'Returns the campaign ID and its status; read the messageCampaign record to follow progress and statistics.',
})
export class SendCampaignTool extends BaseTool<typeof sendCampaignInputSchema> {
  readonly inputSchema = sendCampaignInputSchema;

  constructor(
    private readonly messageCampaignService: MessageCampaignService,
    private readonly messageCampaignScheduleService: MessageCampaignScheduleService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {
    super();
  }

  async execute({
    input: { campaignId, scheduledAt, expectedRecipientCount },
    context: { workspaceId, userWorkspaceId, locale },
  }: ToolExecuteArgs<typeof sendCampaignInputSchema>): Promise<ToolOutput> {
    if (!isDefined(userWorkspaceId)) {
      return {
        success: false,
        message: 'Failed to send campaign',
        error: 'This tool can only run on behalf of a workspace member',
      };
    }

    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const scheduledAtDate = isDefined(scheduledAt)
      ? new Date(scheduledAt)
      : undefined;

    const preview = await this.messageCampaignService.previewSend({
      workspaceId,
      userWorkspaceId,
      campaignId,
      scheduledAt: scheduledAtDate,
      locale,
    });

    if (preview.blockers.length > 0) {
      return {
        success: false,
        message: 'Failed to send campaign',
        error: preview.blockers.map(({ message }) => message).join(' '),
      };
    }

    const sendableCount = preview.audience?.sendable ?? 0;

    if (sendableCount !== expectedRecipientCount) {
      return {
        success: false,
        message: 'Failed to send campaign',
        error: `The campaign would now reach ${sendableCount} recipient(s), not the ${expectedRecipientCount} that were approved. Show the person the new count before sending.`,
      };
    }

    const { queuedCount } =
      await this.messageCampaignScheduleService.sendNowOrScheduleOrThrow({
        workspaceId,
        userWorkspaceId,
        campaignId,
        scheduledAt: scheduledAtDate,
      });

    return {
      success: true,
      message: isDefined(scheduledAtDate)
        ? `Campaign scheduled for ${scheduledAtDate.toISOString()} to ${queuedCount} recipient(s)`
        : `Campaign is sending to ${queuedCount} recipient(s)`,
      result: {
        campaignId,
        status: isDefined(scheduledAtDate)
          ? MessageCampaignStatus.SCHEDULED
          : MessageCampaignStatus.SENDING,
        queuedCount,
      },
    };
  }
}
