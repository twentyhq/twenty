import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Not, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('apiKeyRoleMap')
export class WorkspaceApiKeyRoleMapCacheService extends WorkspaceCacheProvider<
  Record<string, string>
> {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<Record<string, string>> {
    const roleTargetsMap = await this.roleTargetRepository.find({
      where: {
        workspaceId,
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
