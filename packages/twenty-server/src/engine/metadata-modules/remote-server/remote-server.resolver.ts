import { UseGuards } from '@nestjs/common';
import { Resolver, Args, Mutation } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import { DeleteRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/delete-remote-server.input';
import { RemoteServerDTO } from 'src/engine/metadata-modules/remote-server/dtos/remote-server.dto';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => RemoteServerDTO)
export class RemoteServerResolver {
  constructor(private readonly remoteServerService: RemoteServerService) {}

  @Mutation(() => RemoteServerDTO)
  async createOneRemoteServer(
    @Args('input') input: CreateRemoteServerInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.remoteServerService.createOneRemoteServer(input, workspaceId);
  }

  @Mutation(() => RemoteServerDTO)
  async deleteOneRemoteServer(
    @Args('input') { id }: DeleteRemoteServerInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.remoteServerService.deleteOneRemoteServer(id, workspaceId);
  }
}
