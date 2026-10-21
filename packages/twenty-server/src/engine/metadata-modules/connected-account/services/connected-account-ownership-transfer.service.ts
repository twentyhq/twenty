import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@Injectable()
export class ConnectedAccountOwnershipTransferService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  // Reassigns a departing member's connections to a custodian instead of
  // orphaning them; personal app connections are someone else's credential,
  // which no custodian can legitimately reconnect, so they are deleted. Every
  // path removing a member from a still-active workspace must call this
  // before deleting the userWorkspace.
  async transferConnectedAccountsOwnershipToCustodian({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }) {
    await this.connectedAccountMetadataService.deletePersonalAppConnectedAccounts(
      {
        userWorkspaceId: removedUserWorkspace.id,
        workspaceId: removedUserWorkspace.workspaceId,
      },
    );

    const custodianUserWorkspace =
      await this.userRoleService.resolveCustodianUserWorkspace({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (isDefined(custodianUserWorkspace)) {
      await this.connectedAccountMetadataService.transferOwnership({
        fromUserWorkspaceId: removedUserWorkspace.id,
        toUserWorkspaceId: custodianUserWorkspace.id,
        workspaceId: removedUserWorkspace.workspaceId,
      });
    }
  }
}
