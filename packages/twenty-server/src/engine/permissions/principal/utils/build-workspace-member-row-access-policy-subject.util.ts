/* @license Enterprise */

import { buildRoleRowAccessPolicySubject } from 'src/engine/permissions/principal/utils/build-role-row-access-policy-subject.util';
import { type RowAccessPolicySubject } from 'src/engine/permissions/combine/types/row-access-policy.type';

export const buildWorkspaceMemberRowAccessPolicySubject = ({
  workspaceMemberId,
  ...roleSubjectArguments
}: Parameters<typeof buildRoleRowAccessPolicySubject>[0] & {
  workspaceMemberId: string;
}): RowAccessPolicySubject => {
  const roleSubject = buildRoleRowAccessPolicySubject(roleSubjectArguments);

  return {
    ...roleSubject,
    principalIds: [...(roleSubject.principalIds ?? []), workspaceMemberId],
  };
};
