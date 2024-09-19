import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FindManyRemoteTablesInput } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/find-many-remote-tables-input';
import { RemoteTableInput } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table-input';
import { RemoteTableDTO } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import { RemoteTableService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.service';
import { remoteTableGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/remote-server/remote-table/utils/remote-table-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class RemoteTableResolver {
  constructor(private readonly remoteTableService: RemoteTableService) {}

  @Query(() => [RemoteTableDTO])
  async findDistantTablesWithStatus(
    @Args('input') input: FindManyRemoteTablesInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteTableService.findDistantTablesWithStatus(
        input.id,
        workspaceId,
        input.shouldFetchPendingSchemaUpdates,
      );
    } catch (error) {
      remoteTableGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => RemoteTableDTO)
  async syncRemoteTable(
    @Args('input') input: RemoteTableInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteTableService.syncRemoteTable(input, workspaceId);
    } catch (error) {
      remoteTableGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => RemoteTableDTO)
  async unsyncRemoteTable(
    @Args('input') input: RemoteTableInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteTableService.unsyncRemoteTable(
        input,
        workspaceId,
      );
    } catch (error) {
      remoteTableGraphqlApiExceptionHandler(error);
    }
  }

  @Mutation(() => RemoteTableDTO)
  async syncRemoteTableSchemaChanges(
    @Args('input') input: RemoteTableInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.remoteTableService.syncRemoteTableSchemaChanges(
        input,
        workspaceId,
      );
    } catch (error) {
      remoteTableGraphqlApiExceptionHandler(error);
    }
  }
}
