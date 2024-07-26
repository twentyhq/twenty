import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { CreatedBySource } from 'src/engine/metadata-modules/field-metadata/composite-types/created-by.composite-type';

@WorkspaceQueryHook(`*.createMany`)
export class CreatedByPreQueryHook implements WorkspaceQueryHookInstance {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    objectName: string,
    // TODO: Fix this type
    payload: CreateManyResolverArgs<any>,
  ): Promise<CreateManyResolverArgs<any>> {
    // const entityRepository =
    //   await this.twentyORMGlobalManager.getRepositoryForWorkspace<CustomWorkspaceEntity>(
    //     workspaceId,
    //     objectName,
    //   );
    const workspaceMemberRrepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );
    // TODO: Check if we can have multiple workspace members for the same user
    const workspaceMember = await workspaceMemberRrepository.findOne({
      where: {
        userId,
      },
    });

    if (!workspaceMember) {
      throw new Error(`Workspace member can't be found for user ${userId}`);
    }

    for (const datum of payload.data) {
      if (!datum.createdBy) {
        datum.createdBy = {};
        datum.createdBy.source = CreatedBySource.MANUAL;
        datum.createdBy.workspaceMemberId = workspaceMember.id;
        datum.createdBy.name = `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`;
      }
    }

    console.log('payload', JSON.stringify(payload, null, 2));

    return payload;
  }
}
