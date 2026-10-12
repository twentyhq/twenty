import { resolveApplicationRoleRestriction } from 'src/engine/twenty-orm/utils/resolve-application-role-restriction.util';

describe('resolveApplicationRoleRestriction', () => {
  it.each([true, false])(
    'restricts to the application role (missing role tolerated: %s)',
    (isMissingApplicationRoleTolerated) => {
      expect(
        resolveApplicationRoleRestriction({
          application: { defaultRoleId: 'application-role-id' },
          isMissingApplicationRoleTolerated,
        }),
      ).toEqual({ applicationRoleId: 'application-role-id' });
    },
  );

  it('denies an application without a role when a missing role is not tolerated', () => {
    expect(
      resolveApplicationRoleRestriction({
        application: { defaultRoleId: null },
        isMissingApplicationRoleTolerated: false,
      }),
    ).toEqual({ applicationRoleId: null });
  });

  it('adds no restriction for an application without a role when a missing role is tolerated', () => {
    expect(
      resolveApplicationRoleRestriction({
        application: { defaultRoleId: null },
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({});
  });

  it('adds no restriction without an application', () => {
    expect(
      resolveApplicationRoleRestriction({
        application: undefined,
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({});
  });
});
