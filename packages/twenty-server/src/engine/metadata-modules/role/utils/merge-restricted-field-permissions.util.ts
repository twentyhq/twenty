import { type RestrictedFieldPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const mergePermissionValue = (
  first: boolean | null | undefined,
  second: boolean | null | undefined,
) => (first === false || second === false ? false : (second ?? first));

// A target column is restricted by its own row and by its head's: the stricter value wins
export const mergeRestrictedFieldPermissions = (
  existing: RestrictedFieldPermissions | undefined,
  incoming: RestrictedFieldPermissions,
): RestrictedFieldPermissions =>
  isDefined(existing)
    ? {
        canRead: mergePermissionValue(existing.canRead, incoming.canRead),
        canUpdate: mergePermissionValue(existing.canUpdate, incoming.canUpdate),
      }
    : incoming;
