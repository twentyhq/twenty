import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { MessageCampaignDetailsDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-details.dto';
import { MessageCampaignSummaryDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-summary.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MessageCampaignQueryService } from 'src/modules/emailing/services/message-campaign-query.service';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard, NoPermissionGuard)
@MetadataResolver()
export class MessageCampaignResolver {
  constructor(
    private readonly messageCampaignQueryService: MessageCampaignQueryService,
  ) {}

  @Query(() => [MessageCampaignSummaryDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async messageCampaigns(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<MessageCampaignSummaryDTO[]> {
    return this.messageCampaignQueryService.findAll(currentWorkspace.id);
  }

  @Query(() => MessageCampaignDetailsDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async messageCampaign(
    @Args('id', { type: () => String }) id: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<MessageCampaignDetailsDTO> {
    return this.messageCampaignQueryService.findOne({
      workspaceId: currentWorkspace.id,
      campaignId: id,
      workspaceMemberId,
    });
  }
}
