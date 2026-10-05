import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export const setTestConnectedAccountHandleAliases = async ({
  connectedAccountId,
  handleAliases,
}: {
  connectedAccountId: string;
  handleAliases: string[];
}): Promise<void> => {
  await getCoreRepository<ConnectedAccountEntity>(
    ConnectedAccountEntity,
  ).update({ id: connectedAccountId }, { handleAliases });
};
