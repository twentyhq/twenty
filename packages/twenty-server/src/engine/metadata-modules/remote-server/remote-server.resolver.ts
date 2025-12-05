import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/create-remote-server.input';
import { RemoteServerIdInput } from 'src/engine/metadata-modules/remote-server/dtos/remote-server-id.input';
import { RemoteServerTypeInput } from 'src/engine/metadata-modules/remote-server/dtos/remote-server-type.input';
import { RemoteServerDTO } from 'src/engine/metadata-modules/remote-server/dtos/remote-server.dto';
import { UpdateRemoteServerInput } from 'src/engine/metadata-modules/remote-server/dtos/update-remote-server.input';
import { type RemoteServerType } from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { RemoteServerService } from 'src/engine/metadata-modules/remote-server/remote-server.service';
import { remoteServerGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/remote-server/utils/remote-server-graphql-api-exception-handler.util';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.DATA_MODEL),
)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver()
export class RemoteServerResolver {
  constructor(
    private readonly remoteServerService: RemoteServerService<RemoteServerType>,
  ) {}

  @Mutation(() => RemoteServerDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async createOneRemoteServer(
    @Args('input') input: CreateRemoteServerInput<RemoteServerType>,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async updateOneRemoteServer(
    @Args('input') input: UpdateRemoteServerInput<RemoteServerType>,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  async deleteOneRemoteServer(
    @Args('input') { id }: RemoteServerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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
