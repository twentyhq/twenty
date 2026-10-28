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
import { SEND_CAMPAIGN_TOOL_NAME } from 'src/modules/emailing/constants/send-campaign-tool-name.constant';
import { MessageCampaignScheduleService } from 'src/modules/emailing/services/message-campaign-schedule.service';

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
  name: SEND_CAMPAIGN_TOOL_NAME,
  category: ToolCategory.ACTION,
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
  requiredFeatureFlags: [FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED],
  description:
    'Send an email campaign to its list now, or schedule it. This emails real people and cannot be undone once sending starts. ' +
    'Only call it after the person explicitly asked to send this campaign and approved the recipient count from preview_campaign_send. ' +
    'Unsubscribed and suppressed recipients are always skipped. A scheduled send goes to the list as it is at send time. ' +
    'Returns the campaign ID and its status; read the messageCampaign record to follow progress and statistics.',
})
export class SendCampaignTool extends BaseTool<typeof sendCampaignInputSchema> {
  readonly inputSchema = sendCampaignInputSchema;

  constructor(
    private readonly messageCampaignScheduleService: MessageCampaignScheduleService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {
    super();
  }

  async execute({
    input: { campaignId, scheduledAt, expectedRecipientCount },
    context: { workspaceId, userWorkspaceId },
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

    const { queuedCount } =
      await this.messageCampaignScheduleService.sendNowOrScheduleOrThrow({
        workspaceId,
        userWorkspaceId,
        campaignId,
        scheduledAt: scheduledAtDate,
        expectedRecipientCount,
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
