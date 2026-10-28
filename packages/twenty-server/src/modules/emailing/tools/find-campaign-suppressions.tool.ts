import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { z } from 'zod';

import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';

const findCampaignSuppressionsInputSchema = z.object({
  searchTerm: z
    .string()
    .optional()
    .describe('Part of an email address to look for.'),
  reason: z
    .enum(MessageSuppressionReason)
    .optional()
    .describe(
      'BOUNCE and COMPLAINT block every campaign, UNSUBSCRIBE blocks all campaigns or one topic, TRACKING only turns off open and click tracking.',
    ),
  unsubscribeTopicId: z
    .uuid()
    .optional()
    .describe('Only return unsubscribes from this topic.'),
  limit: z.number().int().min(1).max(100).default(30),
  offset: z.number().int().min(0).default(0),
});

@DefineTool({
  name: 'find_campaign_suppressions',
  category: ToolCategory.ACTION,
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
  requiredFeatureFlags: [FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED],
  description:
    'List the email addresses that campaigns skip: bounces, spam complaints, unsubscribes (global or per topic) and tracking opt-outs, newest first. ' +
    'Use it to explain why someone is not receiving campaigns. Read only: suppressions can only be removed from the settings page.',
})
export class FindCampaignSuppressionsTool extends BaseTool<
  typeof findCampaignSuppressionsInputSchema
> {
  readonly inputSchema = findCampaignSuppressionsInputSchema;

  constructor(
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof findCampaignSuppressionsInputSchema
  >): Promise<ToolOutput> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const { records, totalCount } =
      await this.messageSuppressionService.findSuppressions({
        workspaceId,
        ...input,
      });

    return {
      success: true,
      message: `Found ${totalCount} suppression(s)`,
      result: {
        totalCount,
        suppressions: records.map(
          ({ id, emailAddress, reason, unsubscribeTopicId, createdAt }) => ({
            id,
            emailAddress,
            reason,
            unsubscribeTopicId,
            createdAt,
          }),
        ),
      },
    };
  }
}
