import { isNonEmptyString } from '@/utils/typeguard/isNonEmptyString';

export const getWorkspaceMemberNameOrEmail = <
  UserEmail extends string | null,
>(workspaceMember: {
  name: { firstName: string; lastName: string };
  userEmail: UserEmail;
}): string | UserEmail => {
  const fullName =
    `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

  return isNonEmptyString(fullName) ? fullName : workspaceMember.userEmail;
};
