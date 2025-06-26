import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

@Injectable()
export class BlocklistRepository {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async getById(
    id: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity | null> {
    const blockListRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        BlocklistWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    return blockListRepository.findOneBy({
      id,
    });
  }

  public async getByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity[]> {
    const blockListRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        BlocklistWorkspaceEntity,
      );

    return blockListRepository.find({
      where: {
        workspaceMemberId,
      },
    });
  }
}
