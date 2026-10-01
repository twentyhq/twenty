/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Injectable()
export class MemberCustodianService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly userRoleService: UserRoleService,
  ) {}

  async resolveCustodianUserWorkspace({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<UserWorkspaceEntity | undefined> {
    const otherUserWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId: removedUserWorkspace.workspaceId,
        id: Not(removedUserWorkspace.id),
      },
      order: { createdAt: 'ASC' },
    });

    if (otherUserWorkspaces.length === 0) {
      return undefined;
    }

    const actingUserWorkspace = otherUserWorkspaces.find(
      (otherUserWorkspace) => otherUserWorkspace.id === actingUserWorkspaceId,
    );

    if (isDefined(actingUserWorkspace)) {
      return actingUserWorkspace;
    }

    const rolesByUserWorkspaceId =
      await this.userRoleService.getRolesByUserWorkspaces({
        userWorkspaceIds: otherUserWorkspaces.map(
          (otherUserWorkspace) => otherUserWorkspace.id,
        ),
        workspaceId: removedUserWorkspace.workspaceId,
      });

    const oldestAdminUserWorkspace = otherUserWorkspaces.find(
      (otherUserWorkspace) =>
        rolesByUserWorkspaceId
          .get(otherUserWorkspace.id)
          ?.some(
            (role) =>
              role.universalIdentifier ===
              STANDARD_ROLE.admin.universalIdentifier,
          ),
    );

    return oldestAdminUserWorkspace ?? otherUserWorkspaces[0];
  }
}
