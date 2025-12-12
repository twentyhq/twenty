import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

@Injectable()
export class BlocklistRepository {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async getById(
    id: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const blockListRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            BlocklistWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        return blockListRepository.findOneBy({
          id,
        });
      },
    );
  }

  public async getByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const blockListRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            BlocklistWorkspaceEntity,
          );

        return blockListRepository.find({
          where: {
            workspaceMemberId,
          },
        });
      },
    );
  }
}
