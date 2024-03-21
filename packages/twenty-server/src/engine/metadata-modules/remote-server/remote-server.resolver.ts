import { UseGuards } from '@nestjs/common';
import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import { RemoteServerIdInput } from 'src/engine/metadata-modules/remote-server/dtos/remote-server-id.input';
import { RemoteServerTypeInput } from 'src/engine/metadata-modules/remote-server/dtos/remote-server-type.input';
import { RemoteServerDTO } from 'src/engine/metadata-modules/remote-server/dtos/remote-server.dto';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';

@UseGuards(JwtAuthGuard)
@Resolver()
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
    @Args('input') { id }: RemoteServerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.remoteServerService.deleteOneRemoteServer(id, workspaceId);
  }

  @Query(() => RemoteServerDTO)
  async findOneRemoteServerById(
    @Args('input') { id }: RemoteServerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.remoteServerService.findOneByIdWithinWorkspace(id, workspaceId);
  }

  @Query(() => [RemoteServerDTO])
  async findManyRemoteServersByType(
    @Args('input') { type }: RemoteServerTypeInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    return this.remoteServerService.findManyByTypeWithinWorkspace(
      type,
      workspaceId,
    );
  }
}
