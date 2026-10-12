import { resolveApplicationRoleId } from 'src/engine/twenty-orm/utils/resolve-application-role-id.util';

describe('resolveApplicationRoleId', () => {
  it.each([true, false])(
    'restricts to the application role (missing role tolerated: %s)',
    (isMissingApplicationRoleTolerated) => {
      expect(
        resolveApplicationRoleId({
          application: { defaultRoleId: 'application-role-id' },
          isMissingApplicationRoleTolerated,
        }),
      ).toEqual({ applicationRoleId: 'application-role-id' });
    },
  );

  it('denies an application without a role when a missing role is not tolerated', () => {
    expect(
      resolveApplicationRoleId({
        application: { defaultRoleId: null },
        isMissingApplicationRoleTolerated: false,
      }),
    ).toEqual({ applicationRoleId: null });
  });

  it('adds no restriction for an application without a role when a missing role is tolerated', () => {
    expect(
      resolveApplicationRoleId({
        application: { defaultRoleId: null },
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({});
  });

  it('adds no restriction without an application', () => {
    expect(
      resolveApplicationRoleId({
        application: undefined,
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({});
  });
});
