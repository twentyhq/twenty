import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CreateUserInput } from 'src/mkt-core/user-management/dto/create-user.input';
import { UserOutput } from 'src/mkt-core/user-management/dto/user.output';
import { PersonUserManagementService } from 'src/mkt-core/user-management/person-user-management.service';

@UseGuards(UserAuthGuard, WorkspaceAuthGuard)
@Resolver(() => UserOutput)
export class PersonUserManagementResolver {
  constructor(
    private readonly personUserManagementService: PersonUserManagementService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Query(() => [UserOutput])
  async getPersonUsers(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
  ) {
    const _dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    // _debug: _dataSource.entityMetadatas.map((m) => m.name)

    return this.personUserManagementService.listPersonUsers(workspaceId);
  }

  @Mutation(() => UserOutput)
  async createPersonUser(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('input', { type: () => CreateUserInput })
    input: CreateUserInput,
  ) {
    return this.personUserManagementService.createPersonUser(
      workspaceId,
      input,
    );
  }
}
