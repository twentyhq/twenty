import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { DuplicatedMessageListDTO } from 'src/modules/emailing/dtos/duplicated-message-list.dto';
import { TriggerAddPeopleToMessageListJobResultDTO } from 'src/modules/emailing/dtos/trigger-add-people-to-message-list-job-result.dto';
import { TriggerAddPeopleToMessageListJobInput } from 'src/modules/emailing/dtos/trigger-add-people-to-message-list-job.input';
import { AddPeopleToMessageListJobService } from 'src/modules/emailing/services/add-people-to-message-list-job.service';
import { MessageListDuplicationService } from 'src/modules/emailing/services/message-list-duplication.service';
import { MessageListGraphqlApiExceptionFilter } from 'src/modules/emailing/utils/message-list-graphql-api-exception.filter';

// The service checks object permissions, so no settings permission is required
@MetadataResolver()
@UseFilters(
  MessageListGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
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
  FeatureFlagGuard,
)
@UsePipes(ResolverValidationPipe)
export class MessageListResolver {
  constructor(
    private readonly messageListDuplicationService: MessageListDuplicationService,
    private readonly addPeopleToMessageListJobService: AddPeopleToMessageListJobService,
  ) {}

  @Mutation(() => DuplicatedMessageListDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
  async duplicateMessageList(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<DuplicatedMessageListDTO> {
    const authContext = getWorkspaceAuthContext();

    return this.messageListDuplicationService.duplicateMessageList({
      messageListId: id,
      userWorkspaceId,
      authContext,
    });
  }

  @Mutation(() => TriggerAddPeopleToMessageListJobResultDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
  async triggerAddPeopleToMessageListJob(
    @Args('input') input: TriggerAddPeopleToMessageListJobInput,
  ): Promise<TriggerAddPeopleToMessageListJobResultDTO> {
    return this.addPeopleToMessageListJobService.triggerAddPeopleToMessageListJob(
      { ...input, authContext: getWorkspaceAuthContext() },
    );
  }

  @Query(() => JobStatusDTO, { nullable: true })
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
  async findAddPeopleToMessageListJobStatus(
    @Args('messageListId', { type: () => UUIDScalarType })
    messageListId: string,
  ): Promise<JobStatusDTO | null> {
    return this.addPeopleToMessageListJobService.findAddPeopleToMessageListJobStatus(
      {
        messageListId,
        workspaceId: getWorkspaceAuthContext().workspace.id,
      },
    );
  }
}
