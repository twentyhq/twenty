import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { MessageCampaignEngagementDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement.dto';
import { MessageCampaignEngagementInput } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement.input';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailingDomainGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/emailing-domain-graphql-api-exception.filter';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { MessageCampaignFollowUpDraftDTO } from 'src/modules/emailing/dtos/message-campaign-follow-up-draft.dto';
import { CampaignEngagementReportService } from 'src/modules/emailing/services/campaign-engagement-report.service';
import { CampaignFollowUpService } from 'src/modules/emailing/services/campaign-follow-up.service';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard, NoPermissionGuard)
@UseFilters(
  EmailGroupAccessGraphqlApiExceptionFilter,
  EmailingDomainGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class CampaignEngagementResolver {
  constructor(
    private readonly campaignEngagementReportService: CampaignEngagementReportService,
    private readonly campaignFollowUpService: CampaignFollowUpService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {}

  @Mutation(() => MessageCampaignFollowUpDraftDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async createMessageCampaignFollowUpDraft(
    @Args('input') input: MessageCampaignEngagementInput,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageCampaignFollowUpDraftDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.campaignFollowUpService.createDraftFromClickers({
      messageCampaignId: input.messageCampaignId,
      activityFilter:
        input.activityFilter ?? CampaignEngagementActivityFilter.FILTERED,
      userWorkspaceId,
      authContext: getWorkspaceAuthContext(),
    });
  }

  @Query(() => MessageCampaignEngagementDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async messageCampaignEngagement(
    @Args('input') input: MessageCampaignEngagementInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<MessageCampaignEngagementDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.campaignEngagementReportService.getReport({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      messageCampaignId: input.messageCampaignId,
      activityFilter:
        input.activityFilter ?? CampaignEngagementActivityFilter.FILTERED,
    });
  }
}
