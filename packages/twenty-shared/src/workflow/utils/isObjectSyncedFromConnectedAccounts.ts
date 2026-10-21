import { OBJECTS_SYNCED_FROM_CONNECTED_ACCOUNTS } from '../constants/ObjectsSyncedFromConnectedAccounts';

export const isObjectSyncedFromConnectedAccounts = ({
  nameSingular,
}: {
  nameSingular: string;
}): boolean => {
  return OBJECTS_SYNCED_FROM_CONNECTED_ACCOUNTS.includes(
    nameSingular as (typeof OBJECTS_SYNCED_FROM_CONNECTED_ACCOUNTS)[number],
  );
};
