import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { FindMessageTrackingOptOutsInput } from 'src/engine/core-modules/emailing-domain/dtos/find-message-tracking-opt-outs.input';
import { MessageTrackingOptOutListDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-tracking-opt-out.dto';
import { EmailGroupAccessGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/email-group-access-graphql-api-exception.filter';
import { EmailingDomainGraphqlApiExceptionFilter } from 'src/engine/core-modules/emailing-domain/filters/emailing-domain-graphql-api-exception.filter';
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
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';

@UseGuards(
  WorkspaceAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UseFilters(
  EmailGroupAccessGraphqlApiExceptionFilter,
  EmailingDomainGraphqlApiExceptionFilter,
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => MessageTrackingOptOutListDTO)
export class MessageTrackingConsentResolver {
  constructor(
    private readonly messageTrackingConsentService: MessageTrackingConsentService,
    private readonly emailGroupAccessService: EmailGroupAccessService,
  ) {}

  @Query(() => MessageTrackingOptOutListDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED)
  async messageTrackingOptOuts(
    @Args('input') input: FindMessageTrackingOptOutsInput,
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<MessageTrackingOptOutListDTO> {
    this.emailGroupAccessService.validateEmailGroupAccessOrThrow();

    return this.messageTrackingConsentService.findDeniedConsents({
      workspaceId: currentWorkspace.id,
      searchTerm: input.searchTerm,
      limit: input.limit,
      offset: input.offset,
    });
  }
}
