import { type RestrictedFieldPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const mergePermissionValue = ({
  existing,
  incoming,
}: {
  existing: boolean | null | undefined;
  incoming: boolean | null | undefined;
}) =>
  existing === false || incoming === false ? false : (incoming ?? existing);

// A target column is restricted by its own row and by its head's: the stricter value wins
export const mergeRestrictedFieldPermissions = ({
  existing,
  incoming,
}: {
  existing: RestrictedFieldPermissions | undefined;
  incoming: RestrictedFieldPermissions;
}): RestrictedFieldPermissions =>
  isDefined(existing)
    ? {
        canRead: mergePermissionValue({
          existing: existing.canRead,
          incoming: incoming.canRead,
        }),
        canUpdate: mergePermissionValue({
          existing: existing.canUpdate,
          incoming: incoming.canUpdate,
        }),
      }
    : incoming;
