import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';

@Injectable()
export class ConnectedAccountOwnershipTransferService {
  constructor(
    private readonly userWorkspaceSuccessorService: UserWorkspaceSuccessorService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  // Reassigns app connections owned by a departing member to another member
  // instead of leaving them orphaned against a userWorkspaceId that's about
  // to be deleted. Every path that removes a member from a workspace while
  // it stays active must call this before deleting the userWorkspace.
  async transferConnectedAccountsOwnershipToSuccessor({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }) {
    const successorUserWorkspace =
      await this.userWorkspaceSuccessorService.findSuccessorUserWorkspace({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (isDefined(successorUserWorkspace)) {
      await this.connectedAccountMetadataService.transferOwnership({
        fromUserWorkspaceId: removedUserWorkspace.id,
        toUserWorkspaceId: successorUserWorkspace.id,
        workspaceId: removedUserWorkspace.workspaceId,
      });
    }
  }
}
