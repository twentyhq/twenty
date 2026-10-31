import { isDefined } from 'twenty-shared/utils';

// An application acting for a user is bounded by both the user's role and its own
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
