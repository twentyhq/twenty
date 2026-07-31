import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EmailingDomainException } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { MessageCampaignBodyService } from 'src/modules/emailing/services/message-campaign-body.service';
import {
  type UpdateCampaignBodyToolInput,
  UpdateCampaignBodyToolInputZodSchema,
} from 'src/modules/emailing/tools/update-campaign-body-tool.schema';

@Injectable()
export class UpdateCampaignBodyTool implements Tool {
  private readonly logger = new Logger(UpdateCampaignBodyTool.name);

  description =
    'Replace the body of a draft email campaign (messageCampaign record) with a structured email document. ' +
    'The document is validated against the campaign email schema before anything is written, and the campaign must still be a draft. ' +
    'Requires update permission on campaigns.';
  inputSchema = UpdateCampaignBodyToolInputZodSchema;

  constructor(
    private readonly messageCampaignBodyService: MessageCampaignBodyService,
  ) {}

  async execute(
    parameters: UpdateCampaignBodyToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    if (!isDefined(context.userWorkspaceId)) {
      return {
        success: false,
        message: 'Failed to update campaign body',
        error: 'This tool can only run on behalf of a workspace member',
      };
    }

    try {
      const result = await this.messageCampaignBodyService.updateDraftBody({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        campaignId: parameters.campaignId,
        document: parameters.body,
      });

      return {
        success: true,
        message: `Campaign body updated (${result.blockCount} top-level blocks)`,
        result,
        recordReferences: [
          {
            objectNameSingular: 'messageCampaign',
            recordId: result.campaignId,
            displayName: result.campaignName,
          },
        ],
      };
    } catch (error) {
      if (error instanceof EmailingDomainException) {
        return {
          success: false,
          message: 'Failed to update campaign body',
          error: error.message,
        };
      }

      this.logger.error(`Failed to update campaign body: ${error}`);

      return {
        success: false,
        message: 'Failed to update campaign body',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update campaign body',
      };
    }
  }
}
