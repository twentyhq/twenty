import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';

export const isConnectedAccountUsableByActor = ({
  connectedAccount,
  userWorkspaceId,
}: {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'visibility' | 'userWorkspaceId'
  >;
  userWorkspaceId?: string;
}): boolean =>
  isDefined(userWorkspaceId)
    ? isConnectedAccountUsableByCaller({ connectedAccount, userWorkspaceId })
    : connectedAccount.visibility === 'workspace';
