import { isDefined } from 'twenty-shared/utils';

// An application acting for a user stays within that person's role and within
// the role it declared, so permissions are the intersection of both.
export const resolveRoleIdsForUser = ({
  userRoleId,
  applicationRoleId,
}: {
  userRoleId: string | null | undefined;
  applicationRoleId: string | null | undefined;
}): string[] => {
  // The application's role must never stand in for a missing user role.
  if (!isDefined(userRoleId)) {
    return [];
  }

  return isDefined(applicationRoleId) && applicationRoleId !== userRoleId
    ? [userRoleId, applicationRoleId]
    : [userRoleId];
};
