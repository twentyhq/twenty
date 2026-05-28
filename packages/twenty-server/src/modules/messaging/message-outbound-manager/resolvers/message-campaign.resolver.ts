import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SendMessageCampaignInput } from 'src/modules/messaging/message-outbound-manager/dtos/send-message-campaign.input';
import { SendMessageCampaignOutputDTO } from 'src/modules/messaging/message-outbound-manager/dtos/send-message-campaign.output';
import { MessagingCampaignService } from 'src/modules/messaging/message-outbound-manager/services/messaging-campaign.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
export class MessageCampaignResolver {
  private readonly logger = new Logger(MessageCampaignResolver.name);

  constructor(
    private readonly messagingCampaignService: MessagingCampaignService,
  ) {}

  @Mutation(() => SendMessageCampaignOutputDTO)
  async sendMessageCampaign(
    @Args('input') input: SendMessageCampaignInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<SendMessageCampaignOutputDTO> {
    const result = await this.messagingCampaignService.startCampaign({
      workspaceId: workspace.id,
      userWorkspaceId,
      input,
    });

    return result;
  }
}
