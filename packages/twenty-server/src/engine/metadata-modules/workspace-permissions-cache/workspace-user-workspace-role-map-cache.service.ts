import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/workspace-permissions-cache/types/user-workspace-role-map.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('userWorkspaceRoleMap')
export class WorkspaceUserWorkspaceRoleMapCacheService extends WorkspaceCacheProvider<UserWorkspaceRoleMap> {
  constructor(
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<UserWorkspaceRoleMap> {
    const roleTargetsMap = await this.roleTargetsRepository.find({
      where: {
        workspaceId,
        userWorkspaceId: Not(IsNull()),
      },
    });

    return roleTargetsMap.reduce((acc, roleTarget) => {
      if (isDefined(roleTarget.userWorkspaceId)) {
        acc[roleTarget.userWorkspaceId] = roleTarget.roleId;
      }

      return acc;
    }, {} as UserWorkspaceRoleMap);
  }
}
