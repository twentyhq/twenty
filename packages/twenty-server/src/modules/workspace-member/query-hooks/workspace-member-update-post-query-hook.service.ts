import { InjectRepository } from '@nestjs/typeorm';

import isEmpty from 'lodash.isempty';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceQueryHook({
  key: `workspaceMember.updateOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkspaceMemberUpdateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly userService: UserService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: WorkspaceMemberWorkspaceEntity[],
  ): Promise<void> {
    const workspaceMember = payload[0];

    if (!isDefined(workspaceMember)) {
      return;
    }

    await this.updateUserNameIfUserHasOnlyOneWorkspaceAndNameHasChanged({
      authContext,
      workspaceMember,
    });
  }

  private async updateUserNameIfUserHasOnlyOneWorkspaceAndNameHasChanged({
    authContext,
    workspaceMember,
  }: {
    authContext: AuthContext;
    workspaceMember: WorkspaceMemberWorkspaceEntity;
  }): Promise<void> {
    const userIdForWorkspaceMember = await this.getUserIdForWorkspaceMember({
      authContext,
      workspaceMember,
    });

    if (userIdForWorkspaceMember !== authContext.user?.id) {
      return; // Do not update user name if updated workspace member is not the current user
    }

    const userHasOtherWorkspaces =
      (
        await this.userWorkspaceRepository.find({
          where: {
            userId: userIdForWorkspaceMember,
          },
        })
      ).length > 1;

    if (userHasOtherWorkspaces) {
      return;
    }

    const user = await this.userService.findUserById(userIdForWorkspaceMember);

    if (!isDefined(user)) {
      throw new CommonQueryRunnerException(
        'User not found',
        CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const newUserName: { firstName?: string; lastName?: string } = {};

    if (
      isDefined(workspaceMember.name?.firstName) &&
      user?.firstName !== workspaceMember.name.firstName
    ) {
      newUserName.firstName = workspaceMember.name.firstName;
    }
    if (
      isDefined(workspaceMember.name?.lastName) &&
      user?.lastName !== workspaceMember.name.lastName
    ) {
      newUserName.lastName = workspaceMember.name.lastName;
    }

    if (!isEmpty(newUserName)) {
      await this.userService.updateUserFullName({
        userId: userIdForWorkspaceMember,
        ...newUserName,
      });
    }
  }

  private async getUserIdForWorkspaceMember({
    authContext,
    workspaceMember,
  }: {
    authContext: AuthContext;
    workspaceMember: WorkspaceMemberWorkspaceEntity;
  }): Promise<string> {
    const { workspace } = authContext;

    if (!isDefined(workspace)) {
      throw new Error('Workspace not found');
    }
    const userIdForWorkspaceMember = workspaceMember.userId;

    if (!isDefined(userIdForWorkspaceMember)) {
      throw new Error('User ID for workspace member not found');
    }

    return userIdForWorkspaceMember;
  }
}
