import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import { RemoteServerIdInput } from 'src/engine/metadata-modules/remote-server/dtos/remote-server-id.input';
import { RemoteServerTypeInput } from 'src/engine/metadata-modules/remote-server/dtos/remote-server-type.input';
import { RemoteServerDTO } from 'src/engine/metadata-modules/remote-server/dtos/remote-server.dto';
import { UpdateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/update-remote-server.input';
import { RemoteServerType } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';
import { remoteServerGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/remote-server/utils/remote-server-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class RemoteServerResolver {
  constructor(
    private readonly remoteServerService: RemoteServerService<RemoteServerType>,
  ) {}

  @Mutation(() => RemoteServerDTO)
  async createOneRemoteServer(
    @Args('input') input: CreateRemoteServerInput<RemoteServerType>,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteServerService.createOneRemoteServer(
        input,
        workspaceId,
      );
    } catch (error) {
      remoteServerGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => RemoteServerDTO)
  async updateOneRemoteServer(
    @Args('input') input: UpdateRemoteServerInput<RemoteServerType>,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteServerService.updateOneRemoteServer(
        input,
        workspaceId,
      );
    } catch (error) {
      remoteServerGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => RemoteServerDTO)
  async deleteOneRemoteServer(
    @Args('input') { id }: RemoteServerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteServerService.deleteOneRemoteServer(
        id,
        workspaceId,
      );
    } catch (error) {
      remoteServerGraphqlApiExceptionHandler(error);
    }
  }

  @Query(() => RemoteServerDTO)
  async findOneRemoteServerById(
    @Args('input') { id }: RemoteServerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteServerService.findOneByIdWithinWorkspace(
        id,
        workspaceId,
      );
    } catch (error) {
      remoteServerGraphqlApiExceptionHandler(error);
    }
  }

  @Query(() => [RemoteServerDTO])
  async findManyRemoteServersByType(
    @Args('input')
    { foreignDataWrapperType }: RemoteServerTypeInput<RemoteServerType>,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteServerService.findManyByTypeWithinWorkspace(
        foreignDataWrapperType,
        workspaceId,
      );
    } catch (error) {
      remoteServerGraphqlApiExceptionHandler(error);
    }
  }
}
