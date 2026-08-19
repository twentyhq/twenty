import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EmailingDomainException } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { MessageCampaignDraftService } from 'src/modules/emailing/services/message-campaign-draft.service';
import {
  type SaveCampaignToolInput,
  SaveCampaignToolInputZodSchema,
} from 'src/modules/emailing/tools/save-campaign-tool.schema';

@Injectable()
export class SaveCampaignTool implements Tool {
  private readonly logger = new Logger(SaveCampaignTool.name);

  description =
    'Create a draft email campaign (messageCampaign record) or edit an existing one: name, subject and body. ' +
    'The body is a structured email document validated against the campaign email schema before anything is written. ' +
    'Only draft campaigns can be edited, and this tool never sends anything. ' +
    'Requires create/update permission on campaigns.';
  inputSchema = SaveCampaignToolInputZodSchema;

  constructor(
    private readonly messageCampaignDraftService: MessageCampaignDraftService,
  ) {}

  async execute(
    parameters: SaveCampaignToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    if (!isDefined(context.userWorkspaceId)) {
      return {
        success: false,
        message: 'Failed to save campaign',
        error: 'This tool can only run on behalf of a workspace member',
      };
    }

    try {
      const result = await this.messageCampaignDraftService.saveDraft({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        campaignId: parameters.campaignId,
        name: parameters.name,
        subject: parameters.subject,
        body: parameters.body,
      });

      return {
        success: true,
        message: result.created
          ? `Draft campaign "${result.campaignName}" created`
          : `Campaign "${result.campaignName}" updated`,
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
          message: 'Failed to save campaign',
          error: error.message,
        };
      }

      this.logger.error(`Failed to save campaign: ${error}`);

      return {
        success: false,
        message: 'Failed to save campaign',
        error:
          error instanceof Error ? error.message : 'Failed to save campaign',
      };
    }
  }
}
