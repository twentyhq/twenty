import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import {
  CreatedByMetadata,
  FieldCreatedBySource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/created-by.composite-type';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

type CustomWorkspaceItem = Omit<
  CustomWorkspaceEntity,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};

@WorkspaceQueryHook(`*.createMany`)
export class CreatedByPreQueryHook implements WorkspaceQueryHookInstance {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateManyResolverArgs<CustomWorkspaceItem>,
  ): Promise<CreateManyResolverArgs<CustomWorkspaceItem>> {
    let createdBy: CreatedByMetadata | null = null;

    // If user is logged in, we use the workspace member
    if (authContext.user) {
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          authContext.workspace.id,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: {
          userId: authContext.user?.id,
        },
      });

      if (!workspaceMember) {
        throw new Error(
          `Workspace member can't be found for user ${authContext.user.id}`,
        );
      }

      createdBy = {
        source: FieldCreatedBySource.MANUAL,
        workspaceMemberId: workspaceMember.id,
        name: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      };
    }

    // If API key is used, we use the API key
    if (authContext.apiKey) {
      createdBy = {
        source: FieldCreatedBySource.API,
        name: authContext.apiKey.name,
      };
    }

    for (const datum of payload.data) {
      // Front-end can fill the source field
      if (createdBy && (!datum.createdBy || !datum.createdBy.name)) {
        datum.createdBy = {
          ...createdBy,
          source: datum.createdBy?.source ?? createdBy.source,
        };
      }
    }

    return payload;
  }
}
