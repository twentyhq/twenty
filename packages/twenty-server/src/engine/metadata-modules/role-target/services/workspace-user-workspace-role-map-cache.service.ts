import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('userWorkspaceRoleMap')
export class WorkspaceUserWorkspaceRoleMapCacheService extends WorkspaceCacheProvider<UserWorkspaceRoleMap> {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<UserWorkspaceRoleMap> {
    const roleTargetsMap = await this.roleTargetRepository.find({
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
