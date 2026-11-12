import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveRlsWorkspaceMember = ({
  principals,
  metadataMaps,
}: {
  principals: Pick<PermissionsPrincipalsWithRolesContext, 'mainPrincipal'>;
  metadataMaps: Pick<PermissionsMetadataMaps, 'flatWorkspaceMemberMaps'>;
}): RlsWorkspaceMember | undefined => {
  const workspaceMemberId = isPermissionMainPrincipalWorkspaceMember(
    principals.mainPrincipal,
  )
    ? principals.mainPrincipal.workspaceMemberId
    : undefined;

  return isDefined(workspaceMemberId)
    ? (metadataMaps.flatWorkspaceMemberMaps?.byId[workspaceMemberId] ?? {
        id: workspaceMemberId,
      })
    : undefined;
};
