import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { SetPersonEmailTrackingConsentInput } from 'src/engine/core-modules/emailing-domain/dtos/set-person-email-tracking-consent.input';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailingDomainGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/emailing-domain-graphql-api-exception.filter';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
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
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard, NoPermissionGuard)
@UseFilters(
  EmailGroupAccessGraphqlApiExceptionFilter,
  EmailingDomainGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class MessageTrackingConsentResolver {
  constructor(
    private readonly messageTrackingConsentService: MessageTrackingConsentService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {}

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
  async setPersonEmailTrackingConsent(
    @Args('input') input: SetPersonEmailTrackingConsentInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<boolean> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageTrackingConsentService.recordDecisionForPerson({
      workspaceId: currentWorkspace.id,
      userWorkspaceId,
      personId: input.personId,
      decision: input.decision,
      source: MessageTrackingConsentSource.WORKSPACE_MEMBER,
    });
  }
}
