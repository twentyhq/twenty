import { type FindOptionsWhere } from 'typeorm';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// SQL counterpart of isConnectedAccountUsableByCaller; keep the two in sync.
export const buildConnectedAccountUsableByCallerWhere = ({
  baseWhere,
  userWorkspaceId,
}: {
  baseWhere: FindOptionsWhere<ConnectedAccountEntity>;
  userWorkspaceId: string;
}): FindOptionsWhere<ConnectedAccountEntity>[] => [
  { ...baseWhere, visibility: 'workspace' },
  { ...baseWhere, userWorkspaceId },
];
