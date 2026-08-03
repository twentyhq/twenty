import { isDefined } from 'twenty-shared/utils';

// An application acting on a user's behalf stays within that person's role and
// within the role it declared, so permissions are the intersection of both. An
// application declaring no role adds no bound rather than denying.
export const resolveRoleIdsForUser = ({
  userRoleId,
  applicationRoleId,
}: {
  userRoleId: string | null | undefined;
  applicationRoleId: string | null | undefined;
}): string[] => {
  // The application's role must never stand in for a missing user role, or it
  // would grant more than the user has.
  if (!isDefined(userRoleId)) {
    return [];
  }

  return isDefined(applicationRoleId) && applicationRoleId !== userRoleId
    ? [userRoleId, applicationRoleId]
    : [userRoleId];
};
