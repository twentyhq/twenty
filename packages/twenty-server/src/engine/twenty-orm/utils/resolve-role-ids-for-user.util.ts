import { isDefined } from 'twenty-shared/utils';

// A request can carry more than one principal. An application acting on a
// user's behalf must stay within that person's role and within the role it
// declared, so both are returned and permissions are the intersection of them.
// An application that declares no role, or that holds the user's own role,
// contributes nothing: no extra bound rather than a denial, and never a
// repeated id, which consumers reject.
export const resolveRoleIdsForUser = ({
  userRoleId,
  applicationRoleId,
}: {
  userRoleId: string | null | undefined;
  applicationRoleId: string | null | undefined;
}): string[] => {
  // A user with no role resolves to nothing at all, as it did before an
  // application could ride along. The application's role must never stand in
  // for a missing user role, or it would grant more than the user has.
  if (!isDefined(userRoleId)) {
    return [];
  }

  return isDefined(applicationRoleId) && applicationRoleId !== userRoleId
    ? [userRoleId, applicationRoleId]
    : [userRoleId];
};
