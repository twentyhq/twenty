import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceV2Service } from 'src/engine/twenty-orm-v2/datasource/workspace-data-source-v2.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';

@Injectable()
export class BlocklistRepository {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceDataSourceV2Service: WorkspaceDataSourceV2Service,
  ) {}

  public async getById(
    id: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const blockListRepository = this.workspaceDataSourceV2Service
          .getDataSource({ useReplica: false })
          .getRepository('blocklist', {
            shouldBypassPermissionChecks: true,
          });

        return blockListRepository.findOneBy({
          id,
        }) as Promise<BlocklistWorkspaceEntity | null>;
      },
      authContext,
    );
  }

  public async getByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
  ): Promise<BlocklistWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const blockListRepository = this.workspaceDataSourceV2Service
          .getDataSource({ useReplica: false })
          .getRepository('blocklist');

        return blockListRepository.find({
          where: {
            workspaceMemberId,
          },
        }) as Promise<BlocklistWorkspaceEntity[]>;
      },
      authContext,
    );
  }
}
