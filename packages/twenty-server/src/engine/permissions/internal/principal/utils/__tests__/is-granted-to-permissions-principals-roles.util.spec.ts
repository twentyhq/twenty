import { isGrantedToPermissionsPrincipalsRoles } from 'src/engine/permissions/internal/principal/utils/is-granted-to-permissions-principals-roles.util';

const buildPrincipals = ({
  roleIds,
  limitingRoleId,
}: {
  roleIds?: string[];
  limitingRoleId?: string;
}) => ({
  mainPrincipal: {
    type: 'workspaceMember' as const,
    roleId: 'assigned-role',
    workspaceMemberId: 'member-1',
    roleIds,
  },
  limitingPrincipal: limitingRoleId
    ? { type: 'agent' as const, roleId: limitingRoleId, agentId: 'agent-1' }
    : undefined,
  applicationPrincipal: { type: 'customApplication' as const },
});

const isGrantedTo =
  (grantedRoleIds: string[]) =>
  (roleId: string): boolean =>
    grantedRoleIds.includes(roleId);

describe('isGrantedToPermissionsPrincipalsRoles', () => {
  it('grants what the assigned role grants', () => {
    expect(
      isGrantedToPermissionsPrincipalsRoles({
        principals: buildPrincipals({}),
        isGrantedToRole: isGrantedTo(['assigned-role']),
      }),
    ).toBe(true);
  });

  it('grants what a system side effect role grants when the assigned role does not', () => {
    expect(
      isGrantedToPermissionsPrincipalsRoles({
        principals: buildPrincipals({
          roleIds: ['extra-role'],
        }),
        isGrantedToRole: isGrantedTo(['extra-role']),
      }),
    ).toBe(true);
  });

  it('still needs every limiting role to agree', () => {
    expect(
      isGrantedToPermissionsPrincipalsRoles({
        principals: buildPrincipals({
          roleIds: ['extra-role'],
          limitingRoleId: 'agent-role',
        }),
        isGrantedToRole: isGrantedTo(['extra-role']),
      }),
    ).toBe(false);
  });

  it('denies when no main role grants', () => {
    expect(
      isGrantedToPermissionsPrincipalsRoles({
        principals: buildPrincipals({
          roleIds: ['extra-role'],
        }),
        isGrantedToRole: isGrantedTo([]),
      }),
    ).toBe(false);
  });
});
