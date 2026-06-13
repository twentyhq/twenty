import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CreateMessageTopicInput } from 'src/engine/core-modules/emailing-domain/dtos/create-message-topic.input';
import { MessageTopicDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-topic.dto';
import { UpdateMessageTopicInput } from 'src/engine/core-modules/emailing-domain/dtos/update-message-topic.input';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MessageTopicService } from 'src/modules/emailing/services/message-topic.service';

// A neutral, non-routable placeholder address so the preview renders the
// workspace's topics without referencing a real recipient.
const UNSUBSCRIBE_PREVIEW_PLACEHOLDER_EMAIL = 'preview@example.com';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => MessageTopicDTO)
export class MessageTopicResolver {
  constructor(
    private readonly messageTopicService: MessageTopicService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Query(() => [MessageTopicDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async messageTopics(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<MessageTopicDTO[]> {
    return this.messageTopicService.getMessageTopics(currentWorkspace.id);
  }

  // Mints a preview token (placeholder recipient + preview claim) for the live
  // unsubscribe page so admins can see exactly what recipients get. Opt-out
  // POSTs are no-ops for preview tokens, so opening it never mutates state.
  @Query(() => String)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  unsubscribePagePreviewUrl(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): string {
    const token = this.unsubscribeTokenService.sign({
      workspaceId: currentWorkspace.id,
      emailAddress: UNSUBSCRIBE_PREVIEW_PLACEHOLDER_EMAIL,
      preview: true,
    });

    return `${this.twentyConfigService.get('SERVER_URL')}/emailing/unsubscribe?t=${token}`;
  }

  @Mutation(() => MessageTopicDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async createMessageTopic(
    @Args('input') input: CreateMessageTopicInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<MessageTopicDTO> {
    return this.messageTopicService.createMessageTopic(
      currentWorkspace.id,
      input,
    );
  }

  @Mutation(() => MessageTopicDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async updateMessageTopic(
    @Args('input') input: UpdateMessageTopicInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<MessageTopicDTO> {
    return this.messageTopicService.updateMessageTopic(
      currentWorkspace.id,
      input,
    );
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async deleteMessageTopic(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.messageTopicService.deleteMessageTopic(currentWorkspace.id, id);

    return true;
  }
}
