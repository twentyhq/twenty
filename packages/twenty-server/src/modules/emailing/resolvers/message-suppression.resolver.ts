import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CreateMessageSuppressionInput } from 'src/engine/core-modules/emailing-domain/dtos/create-message-suppression.input';
import { FindMessageSuppressionsInput } from 'src/engine/core-modules/emailing-domain/dtos/find-message-suppressions.input';
import {
  MessageSuppressionDTO,
  MessageSuppressionListDTO,
} from 'src/engine/core-modules/emailing-domain/dtos/message-suppression.dto';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailingDomainGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/emailing-domain-graphql-api-exception.filter';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { MESSAGE_CAMPAIGN_READ_ACCESS_POLICY } from 'src/modules/emailing/constants/message-campaign-read-access-policy.constant';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const MESSAGE_SUPPRESSION_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
};

@UseFilters(
  EmailGroupAccessGraphqlApiExceptionFilter,
  EmailingDomainGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => MessageSuppressionListDTO)
export class MessageSuppressionResolver {
  constructor(
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {}

  @Query(() => MessageSuppressionListDTO)
  @UseGuards(AccessPolicyGuard(MESSAGE_CAMPAIGN_READ_ACCESS_POLICY))
  async messageSuppressions(
    @Args('input') input: FindMessageSuppressionsInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<MessageSuppressionListDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageSuppressionService.findSuppressions({
      workspaceId: currentWorkspace.id,
      reason: input.reason,
      searchTerm: input.searchTerm,
      unsubscribeTopicId: input.unsubscribeTopicId,
      limit: input.limit,
      offset: input.offset,
    });
  }

  @Mutation(() => MessageSuppressionDTO)
  @UseGuards(AccessPolicyGuard(MESSAGE_SUPPRESSION_WRITE_ACCESS_POLICY))
  async createMessageSuppression(
    @Args('input') input: CreateMessageSuppressionInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<MessageSuppressionDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageSuppressionService.suppressManually({
      workspaceId: currentWorkspace.id,
      emailAddress: input.emailAddress,
      unsubscribeTopicId: input.unsubscribeTopicId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(AccessPolicyGuard(MESSAGE_SUPPRESSION_WRITE_ACCESS_POLICY))
  async deleteMessageSuppression(
    @Args('id', { type: () => UUIDScalarType }) suppressionId: string,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<boolean> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    await this.messageSuppressionService.removeSuppression({
      workspaceId: currentWorkspace.id,
      suppressionId,
    });

    return true;
  }
}
