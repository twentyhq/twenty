import { type FindOptionsWhere, Not } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MyConnectedAccountsFilterInput } from 'src/engine/metadata-modules/connected-account/dtos/my-connected-accounts-filter.input';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';

const buildOwnershipWhere = ({
  workspaceId,
  userWorkspaceId,
  ownedByCaller,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  ownedByCaller?: boolean;
}): FindOptionsWhere<ConnectedAccountEntity>[] => {
  if (ownedByCaller === true) {
    return [{ workspaceId, userWorkspaceId }];
  }

  if (ownedByCaller === false) {
    return [
      {
        workspaceId,
        visibility: 'workspace',
        userWorkspaceId: Not(userWorkspaceId),
      },
    ];
  }

  return buildConnectedAccountUsableByCallerWhere({
    baseWhere: { workspaceId },
    userWorkspaceId,
  });
};

export const buildMyConnectedAccountsWhere = ({
  workspaceId,
  userWorkspaceId,
  filter = {},
}: {
  workspaceId: string;
  userWorkspaceId: string;
  filter?: MyConnectedAccountsFilterInput;
}): FindOptionsWhere<ConnectedAccountEntity>[] => {
  const ownershipWhere = buildOwnershipWhere({
    workspaceId,
    userWorkspaceId,
    ownedByCaller: filter.ownedByCaller,
  });

  const { appConnectionVisibility } = filter;

  if (!isDefined(appConnectionVisibility)) {
    return ownershipWhere;
  }

  // A clause already pinned to the other visibility cannot match an app
  // connection, and spreading over it would widen it to accounts the caller
  // cannot use.
  return ownershipWhere.flatMap((clause) => [
    { ...clause, provider: Not(ConnectedAccountProvider.APP) },
    ...(isDefined(clause.visibility) &&
    clause.visibility !== appConnectionVisibility
      ? []
      : [
          {
            ...clause,
            provider: ConnectedAccountProvider.APP,
            visibility: appConnectionVisibility,
          },
        ]),
  ]);
};
