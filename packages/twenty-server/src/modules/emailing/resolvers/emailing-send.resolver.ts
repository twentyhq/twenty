import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { CampaignAudiencePreviewDTO } from 'src/engine/core-modules/emailing-domain/dtos/campaign-audience-preview.dto';
import { CancelMessageCampaignInput } from 'src/engine/core-modules/emailing-domain/dtos/cancel-message-campaign.input';
import { CancelMessageCampaignOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/cancel-message-campaign-output.dto';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailingDomainGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/emailing-domain-graphql-api-exception.filter';
import { PreviewMessageCampaignAudienceInput } from 'src/engine/core-modules/emailing-domain/dtos/preview-message-campaign-audience.input';
import { SendEmailViaDomainOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-email-via-domain-output.dto';
import { SendMessageCampaignInput } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign.input';
import { SendMessageCampaignTestInput } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign-test.input';
import { SendMessageCampaignOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign-output.dto';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ThrottlerGraphqlApiExceptionFilter } from 'src/engine/core-modules/throttler/filters/throttler-graphql-api-exception.filter';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { MessageCampaignAudienceService } from 'src/modules/emailing/services/message-campaign-audience.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignScheduleService } from 'src/modules/emailing/services/message-campaign-schedule.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { countDeliveredRecipients } from 'src/engine/core-modules/emailing-domain/utils/count-delivered-recipients.util';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
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
  private readonly logger = new Logger(EmailingSendResolver.name);

  constructor(
    private readonly messageCampaignService: MessageCampaignService,
    private readonly messageCampaignScheduleService: MessageCampaignScheduleService,
    private readonly messageCampaignAudienceService: MessageCampaignAudienceService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
    private readonly emailBillingService: EmailBillingService,
    private readonly billingService: BillingService,
  ) {}

  @Mutation(() => SendMessageCampaignOutputDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
  async sendMessageCampaign(
    @Args('input') input: SendMessageCampaignInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<SendMessageCampaignOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    const isPayingCustomer = await this.billingService.isPayingCustomer(
      currentWorkspace.id,
    );

    if (!isPayingCustomer) {
      throw new EmailingDomainException(
        `Campaign ${input.campaignId} cannot be sent: workspace ${currentWorkspace.id} is not on a paid plan`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_REQUIRES_PAID_PLAN,
      );
    }

    await this.emailBillingService.validateEmailSendOrThrow({
      workspaceId: currentWorkspace.id,
      spenders: { userWorkspaceId },
    });

    if (isDefined(input.scheduledAt)) {
      return this.messageCampaignScheduleService.schedule({
        workspaceId: currentWorkspace.id,
        userWorkspaceId,
        campaignId: input.campaignId,
        scheduledAt: input.scheduledAt,
      });
    }

    return this.messageCampaignService.send({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      campaignId: input.campaignId,
    });
  }

  @Mutation(() => CancelMessageCampaignOutputDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
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
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
  async sendMessageCampaignTest(
    @Args('input') input: SendMessageCampaignTestInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<SendEmailViaDomainOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();
    await this.emailBillingService.validateEmailSendOrThrow({
      workspaceId: currentWorkspace.id,
      spenders: { userWorkspaceId },
    });

    const result = await this.messageCampaignService.sendTest({
      workspaceId: currentWorkspace.id,
      toAddress: input.toAddress,
      unsubscribeTopicId: input.unsubscribeTopicId,
      subject: input.subject,
      html: input.body,
      fromAddress: input.fromAddress,
    });

    await this.billAcceptedSend({
      workspaceId: currentWorkspace.id,
      spenders: { userWorkspaceId },
      result,
    });

    return { messageId: result.messageId };
  }

  @Query(() => CampaignAudiencePreviewDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
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

  // The provider has already accepted the mail, so surfacing a billing failure
  // would invite a retry that sends it a second time.
  private async billAcceptedSend({
    workspaceId,
    spenders,
    result,
  }: {
    workspaceId: string;
    spenders: UsageSpenders;
    result: EmailingDomainSendEmailResult;
  }): Promise<void> {
    await this.emailBillingService
      .billSentEmails({
        workspaceId,
        spenders,
        sentEmailCount: countDeliveredRecipients(result.deliveredRecipients),
      })
      .catch((error) => {
        this.logger.error(
          `Workspace ${workspaceId} sent email ${result.messageId} but failed to bill it, so this send is unbilled: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
  }
}
