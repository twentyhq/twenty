import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// The request locale is read from userWorkspace.locale, so a locale written through the record API must reach it too
@WorkspaceQueryHook({
  key: `workspaceMember.updateOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkspaceMemberUpdateOnePostQueryHook implements WorkspacePostQueryHookInstance {
  private readonly logger = new Logger(
    WorkspaceMemberUpdateOnePostQueryHook.name,
  );

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: WorkspaceMemberWorkspaceEntity | WorkspaceMemberWorkspaceEntity[],
  ): Promise<void> {
    const updatedWorkspaceMember = Array.isArray(payload)
      ? payload[0]
      : payload;

    if (!isDefined(updatedWorkspaceMember?.id)) {
      return;
    }

    // Runs after the member update is committed: a failed sync must not report the update itself as failed
    try {
      await this.syncUserWorkspaceLocale(
        authContext,
        updatedWorkspaceMember.id,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync userWorkspace locale for workspace member ${updatedWorkspaceMember.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async syncUserWorkspaceLocale(
    authContext: WorkspaceAuthContext,
    workspaceMemberId: string,
  ): Promise<void> {
    // The payload only carries the fields the caller selected
    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return workspaceMemberRepository.findOne({
          where: { id: workspaceMemberId },
        });
      }, authContext);

    if (!isDefined(workspaceMember) || !isDefined(workspaceMember.locale)) {
      return;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspaceId: authContext.workspace.id,
        userId: workspaceMember.userId,
      },
    });

    if (
      !isDefined(userWorkspace) ||
      userWorkspace.locale === workspaceMember.locale
    ) {
      return;
    }

    await this.userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace({
      locale: workspaceMember.locale as UserWorkspaceEntity['locale'],
      userWorkspaceId: userWorkspace.id,
    });
  }
}
