import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Injectable()
export class ConnectedAccountOwnershipTransferService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly userRoleService: UserRoleService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  // Reassigns app connections owned by a departing member to another member
  // instead of leaving them orphaned against a userWorkspaceId that's about
  // to be deleted. Every path that removes a member from a workspace while
  // it stays active must call this before deleting the userWorkspace.
  async transferConnectedAccountsOwnershipToCustodian({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }) {
    const custodianUserWorkspaceId =
      await this.resolveConnectedAccountsCustodianUserWorkspaceId({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (isDefined(custodianUserWorkspaceId)) {
      await this.connectedAccountMetadataService.transferOwnership({
        fromUserWorkspaceId: removedUserWorkspace.id,
        toUserWorkspaceId: custodianUserWorkspaceId,
        workspaceId: removedUserWorkspace.workspaceId,
      });
    }
  }

  private async resolveConnectedAccountsCustodianUserWorkspaceId({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<string | undefined> {
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
      return actingUserWorkspace.id;
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

    return (oldestAdminUserWorkspace ?? otherUserWorkspaces[0]).id;
  }
}
