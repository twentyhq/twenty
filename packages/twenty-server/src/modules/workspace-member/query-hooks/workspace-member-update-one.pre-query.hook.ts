import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceMemberPreQueryHookService } from 'src/modules/workspace-member/query-hooks/workspace-member-pre-query-hook.service';

@WorkspaceQueryHook(`workspaceMember.updateOne`)
export class WorkspaceMemberUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly workspaceMemberPreQueryHookService: WorkspaceMemberPreQueryHookService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workspaceMemberPreQueryHookService.validateWorkspaceMemberUpdatePermissionOrThrow(
      {
        userWorkspaceId: authContext.userWorkspaceId,
        targettedWorkspaceMemberId: payload.id,
        workspaceId: workspace.id,
        apiKey: authContext.apiKey,
        workspaceMemberId: authContext.workspaceMemberId,
      },
    );

    // TODO: remove this code once we have migrated locale update to userWorkspace update
    if (payload.data.locale) {
      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: {
          id: authContext.userWorkspaceId,
        },
      });

      if (!isDefined(userWorkspace)) {
        throw new AuthException(
          'User workspace not found',
          AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        );
      }

      await this.userWorkspaceRepository.save({
        ...userWorkspace,
        locale: payload.data.locale,
      });
    }

    await this.workspaceMemberPreQueryHookService.completeOnboardingProfileStepIfNameProvided(
      {
        userId: authContext.user?.id,
        workspaceId: workspace.id,
        firstName: payload.data.name?.firstName,
        lastName: payload.data.name?.lastName,
      },
    );

    return payload;
  }
}
