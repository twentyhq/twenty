import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { RemoteServerIdInput } from 'src/engine/metadata-modules/remote-server/dtos/remote-server-id.input';
import { RemoteTableInput } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table-input';
import { RemoteTableDTO } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import { RemoteTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => RemoteTableDTO)
export class RemoteTableResolver {
  constructor(private readonly remoteTableService: RemoteTableService) {}

  @Query(() => [RemoteTableDTO])
  async findAvailableRemoteTablesByServerId(
    @Args('input') { id }: RemoteServerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.remoteTableService.findAvailableRemoteTablesByServerId(
      id,
      workspaceId,
    );
  }

  @Mutation(() => RemoteTableDTO)
  async updateRemoteTableSyncStatus(
    @Args('input') input: RemoteTableInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.remoteTableService.updateRemoteTableSyncStatus(
      input,
      workspaceId,
    );
  }
}
