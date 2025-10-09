import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ChannelSyncSuccess } from 'src/modules/connected-account/channel-sync/dtos/channel-sync-success.dto';
import { ChannelSyncService } from 'src/modules/connected-account/channel-sync/services/channel-sync.service';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ChannelSyncResolver {
  constructor(private readonly channelSyncService: ChannelSyncService) {}

  @Mutation(() => ChannelSyncSuccess)
  async startChannelSync(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<ChannelSyncSuccess> {
    await this.channelSyncService.startChannelSync({
      connectedAccountId,
      workspaceId: workspace.id,
    });

    return { success: true };
  }
}
