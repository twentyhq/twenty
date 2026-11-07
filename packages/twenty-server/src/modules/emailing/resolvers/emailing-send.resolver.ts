import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CampaignAudiencePreviewDTO } from 'src/engine/core-modules/emailing-domain/dtos/campaign-audience-preview.dto';
import { CancelMessageCampaignInput } from 'src/engine/core-modules/emailing-domain/dtos/cancel-message-campaign.input';
import { CancelMessageCampaignOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/cancel-message-campaign-output.dto';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailingDomainGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/emailing-domain-graphql-api-exception.filter';
import { PreviewMessageCampaignAudienceInput } from 'src/engine/core-modules/emailing-domain/dtos/preview-message-campaign-audience.input';
import { PreviewMessageCampaignSendInput } from 'src/engine/core-modules/emailing-domain/dtos/preview-message-campaign-send.input';
import { PreviewMessageCampaignSendOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/preview-message-campaign-send-output.dto';
import { SendEmailViaDomainOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-email-via-domain-output.dto';
import { SendMessageCampaignInput } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign.input';
import { SendMessageCampaignTestInput } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign-test.input';
import { SendMessageCampaignOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign-output.dto';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
import { MessageCampaignAudienceService } from 'src/modules/emailing/services/message-campaign-audience.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignScheduleService } from 'src/modules/emailing/services/message-campaign-schedule.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { MESSAGE_CAMPAIGN_SEND_ACCESS_POLICY } from 'src/modules/emailing/constants/message-campaign-send-access-policy.constant';
import { MESSAGE_CAMPAIGN_WRITE_ACCESS_POLICY } from 'src/modules/emailing/constants/message-campaign-write-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseFilters(
  EmailGroupAccessGraphqlApiExceptionFilter,
  EmailingDomainGraphqlApiExceptionFilter,
  ThrottlerGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
  UsageLimitGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class EmailingSendResolver {
  constructor(
    private readonly messageCampaignService: MessageCampaignService,
    private readonly messageCampaignScheduleService: MessageCampaignScheduleService,
    private readonly messageCampaignAudienceService: MessageCampaignAudienceService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {}

  @Mutation(() => SendMessageCampaignOutputDTO)
  @UseGuards(AccessPolicyGuard(MESSAGE_CAMPAIGN_SEND_ACCESS_POLICY))
  async sendMessageCampaign(
    @Args('input') input: SendMessageCampaignInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<SendMessageCampaignOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignScheduleService.sendNowOrScheduleOrThrow({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      campaignId: input.campaignId,
      scheduledAt: input.scheduledAt,
    });
  }

  @Mutation(() => CancelMessageCampaignOutputDTO)
  @UseGuards(AccessPolicyGuard(MESSAGE_CAMPAIGN_SEND_ACCESS_POLICY))
  async cancelMessageCampaign(
    @Args('input') input: CancelMessageCampaignInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<CancelMessageCampaignOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignLifecycleService.cancelCampaignOrThrow({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      campaignId: input.campaignId,
    });
  }

  @Mutation(() => SendEmailViaDomainOutputDTO)
  @UseGuards(AccessPolicyGuard(MESSAGE_CAMPAIGN_WRITE_ACCESS_POLICY))
  async sendMessageCampaignTest(
    @Args('input') input: SendMessageCampaignTestInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<SendEmailViaDomainOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const result = await this.messageCampaignService.sendTest({
      workspaceId: currentWorkspace.id,
      spenders: { userWorkspaceId },
      toAddress: input.toAddress,
      unsubscribeTopicId: input.unsubscribeTopicId,
      subject: input.subject,
      html: input.body,
      fromAddress: input.fromAddress,
    });

    return { messageId: result.messageId };
  }

  @Query(() => CampaignAudiencePreviewDTO)
  @UseGuards(AccessPolicyGuard(MESSAGE_CAMPAIGN_SEND_ACCESS_POLICY))
  async previewMessageCampaignAudience(
    @Args('input') input: PreviewMessageCampaignAudienceInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<CampaignAudiencePreviewDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignAudienceService.previewAudience({
      workspaceId: currentWorkspace.id,
      listId: input.listId,
      unsubscribeTopicId: input.unsubscribeTopicId,
    });
  }

  @Query(() => PreviewMessageCampaignSendOutputDTO)
  @UseGuards(AccessPolicyGuard(MESSAGE_CAMPAIGN_SEND_ACCESS_POLICY))
  async previewMessageCampaignSend(
    @Args('input') input: PreviewMessageCampaignSendInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Context() context: I18nContext,
  ): Promise<PreviewMessageCampaignSendOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignService.previewSend({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      campaignId: input.campaignId,
      scheduledAt: input.scheduledAt,
      locale: context.req.locale,
    });
  }
}
