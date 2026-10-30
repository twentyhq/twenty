import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

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
import { FeatureFlagGuard } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
import { MessageCampaignAudienceService } from 'src/modules/emailing/services/message-campaign-audience.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignScheduleService } from 'src/modules/emailing/services/message-campaign-schedule.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
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
  @UseGuards(FeatureFlagGuard(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED))
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
  @UseGuards(FeatureFlagGuard(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED))
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
  @UseGuards(FeatureFlagGuard(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED))
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
  @UseGuards(FeatureFlagGuard(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED))
  async previewMessageCampaignAudience(
    @Args('input') input: PreviewMessageCampaignAudienceInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<CampaignAudiencePreviewDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignAudienceService.previewAudience({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      listId: input.listId,
      unsubscribeTopicId: input.unsubscribeTopicId,
    });
  }

  @Query(() => PreviewMessageCampaignSendOutputDTO)
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    }),
    FeatureFlagGuard(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED),
  )
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
