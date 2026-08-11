import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { CreateUnsubscribeTopicInput } from 'src/engine/core-modules/emailing-domain/dtos/create-unsubscribe-topic.input';
import { UnsubscribeTopicDTO } from 'src/engine/core-modules/emailing-domain/dtos/unsubscribe-topic.dto';
import { UpdateUnsubscribeTopicInput } from 'src/engine/core-modules/emailing-domain/dtos/update-unsubscribe-topic.input';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UseFilters(EmailGroupAccessGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => UnsubscribeTopicDTO)
export class UnsubscribeTopicResolver {
  constructor(
    private readonly unsubscribeTopicService: UnsubscribeTopicService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {}

  @Query(() => [UnsubscribeTopicDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async unsubscribeTopics(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<UnsubscribeTopicDTO[]> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.unsubscribeTopicService.getUnsubscribeTopics(
      currentWorkspace.id,
    );
  }

  @Mutation(() => UnsubscribeTopicDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async createUnsubscribeTopic(
    @Args('input') input: CreateUnsubscribeTopicInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<UnsubscribeTopicDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.unsubscribeTopicService.createUnsubscribeTopic(
      currentWorkspace.id,
      input,
    );
  }

  @Mutation(() => UnsubscribeTopicDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async updateUnsubscribeTopic(
    @Args('input') input: UpdateUnsubscribeTopicInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<UnsubscribeTopicDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.unsubscribeTopicService.updateUnsubscribeTopic(
      currentWorkspace.id,
      input,
    );
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_EMAIL_GROUP_ENABLED)
  async deleteUnsubscribeTopic(
    @Args('id') id: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<boolean> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    await this.unsubscribeTopicService.deleteUnsubscribeTopic(
      currentWorkspace.id,
      id,
    );

    return true;
  }
}
