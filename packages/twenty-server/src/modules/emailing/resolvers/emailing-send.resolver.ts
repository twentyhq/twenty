import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CampaignAudiencePreviewDTO } from 'src/engine/core-modules/emailing-domain/dtos/campaign-audience-preview.dto';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { PreviewMessageCampaignAudienceInput } from 'src/engine/core-modules/emailing-domain/dtos/preview-message-campaign-audience.input';
import { SaveMessageCampaignDraftInput } from 'src/engine/core-modules/emailing-domain/dtos/save-message-campaign-draft.input';
import { SaveMessageCampaignDraftOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/save-message-campaign-draft-output.dto';
import { SendEmailViaDomainInput } from 'src/engine/core-modules/emailing-domain/dtos/send-email-via-domain.input';
import { SendEmailViaDomainOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-email-via-domain-output.dto';
import { SendMessageCampaignInput } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign.input';
import { SendMessageCampaignOutputDTO } from 'src/engine/core-modules/emailing-domain/dtos/send-message-campaign-output.dto';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { EmailBillingService } from 'src/modules/emailing/services/email-billing.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UseFilters(EmailGroupAccessGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class EmailingSendResolver {
  constructor(
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly messageCampaignService: MessageCampaignService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
    private readonly emailBillingService: EmailBillingService,
  ) {}

  @Mutation(() => SendEmailViaDomainOutputDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async sendEmailViaEmailingDomain(
    @Args('input') input: SendEmailViaDomainInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<SendEmailViaDomainOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();
    await this.emailBillingService.validateEmailCreditsOrThrow(
      currentWorkspace.id,
    );

    const { emailingDomainId, ...content } = input;
    const result = await this.emailingDomainSenderService.sendEmail(
      currentWorkspace.id,
      emailingDomainId,
      content,
    );

    await this.emailBillingService.billSentEmails({
      workspaceId: currentWorkspace.id,
      sentEmailCount: 1,
    });

    return { messageId: result.messageId };
  }

  @Mutation(() => SendMessageCampaignOutputDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async sendMessageCampaign(
    @Args('input') input: SendMessageCampaignInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<SendMessageCampaignOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();
    await this.emailBillingService.validateEmailCreditsOrThrow(
      currentWorkspace.id,
    );

    return this.messageCampaignService.send({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      workspaceMemberId,
      campaignId: input.campaignId,
      unsubscribeTopicId: input.unsubscribeTopicId,
      listId: input.listId,
      subject: input.subject,
      html: input.body,
      fromAddress: input.fromAddress,
    });
  }

  @Mutation(() => SaveMessageCampaignDraftOutputDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async saveMessageCampaignDraft(
    @Args('input') input: SaveMessageCampaignDraftInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<SaveMessageCampaignDraftOutputDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignService.saveDraft({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      workspaceMemberId,
      ...input,
    });
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async deleteMessageCampaignDraft(
    @Args('campaignId', { type: () => String }) campaignId: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<boolean> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignService.deleteDraft({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      workspaceMemberId,
      campaignId,
    });
  }

  @Query(() => CampaignAudiencePreviewDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async previewMessageCampaignAudience(
    @Args('input') input: PreviewMessageCampaignAudienceInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<CampaignAudiencePreviewDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageCampaignService.previewAudience({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      listId: input.listId,
      unsubscribeTopicId: input.unsubscribeTopicId,
    });
  }
}
