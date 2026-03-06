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
import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
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
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workspaceMemberPreQueryHookService.validateWorkspaceMemberUpdatePermissionOrThrow(
      {
        userWorkspaceId: isUserAuthContext(authContext)
          ? authContext.userWorkspaceId
          : undefined,
        targettedWorkspaceMemberId: payload.id,
        workspaceId: workspace.id,
        apiKey: isApiKeyAuthContext(authContext)
          ? authContext.apiKey
          : undefined,
        workspaceMemberId: isUserAuthContext(authContext)
          ? authContext.workspaceMemberId
          : undefined,
      },
    );

    // TODO: remove this code once we have migrated locale update to userWorkspace update
    if (payload.data.locale && isUserAuthContext(authContext)) {
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
        userId: isUserAuthContext(authContext)
          ? authContext.user.id
          : undefined,
        workspaceId: workspace.id,
        firstName: payload.data.name?.firstName,
        lastName: payload.data.name?.lastName,
      },
    );

    return payload;
  }
}
