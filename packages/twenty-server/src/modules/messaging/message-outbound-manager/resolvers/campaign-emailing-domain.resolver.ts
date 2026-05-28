import { UseGuards, UsePipes } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { EmailingDomainDTO } from 'src/engine/core-modules/emailing-domain/dtos/emailing-domain.dto';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// Mirrors `getEmailingDomains` from EmailingDomainResolver but gated by
// SEND_EMAIL_TOOL (the campaign permission) instead of IS_EMAIL_GROUP_ENABLED
// (an unrelated feature flag). Workspaces that have set up SES + a verified
// domain should be able to compose campaigns regardless of whether the
// email-group feature is enabled.
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SEND_EMAIL_TOOL),
)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class CampaignEmailingDomainResolver {
  constructor(private readonly emailingDomainService: EmailingDomainService) {}

  @Query(() => [EmailingDomainDTO])
  async getCampaignEmailingDomains(
    @AuthWorkspace() currentWorkspace: WorkspaceEntity,
  ): Promise<EmailingDomainDTO[]> {
    return this.emailingDomainService.getEmailingDomains(currentWorkspace);
  }
}
