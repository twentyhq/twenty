import { Injectable } from '@nestjs/common';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

@Injectable()
export class BlocklistRepository {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  public async getById(
    id: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const blockListRepository = this.workspaceOrmManager.getRepository(
        BlocklistWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

      return blockListRepository.findOneBy({
        id,
      });
    }, authContext);
  }

  public async getByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const blockListRepository = this.workspaceOrmManager.getRepository(
        BlocklistWorkspaceEntity,
      );

      return blockListRepository.find({
        where: {
          workspaceMemberId,
        },
      });
    }, authContext);
  }
}
