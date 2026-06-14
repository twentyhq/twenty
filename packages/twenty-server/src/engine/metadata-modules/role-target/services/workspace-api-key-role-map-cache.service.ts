import { Injectable } from '@nestjs/common';

import { IsNull, Not } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('apiKeyRoleMap')
export class WorkspaceApiKeyRoleMapCacheService extends WorkspaceCacheProvider<
  Record<string, string>
> {
  constructor(
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<Record<string, string>> {
    const roleTargetsMap = await this.roleTargetRepository.find(workspaceId, {
      where: {
        apiKeyId: Not(IsNull()),
      },
    });

    return roleTargetsMap.reduce(
      (acc, roleTarget) => {
        if (roleTarget.apiKeyId) {
          acc[roleTarget.apiKeyId] = roleTarget.roleId;
        }

        return acc;
      },
      {} as Record<string, string>,
    );
  }
}
