import { resolveApplicationRoleRestriction } from 'src/engine/twenty-orm/utils/resolve-application-role-restriction.util';

describe('resolveApplicationRoleRestriction', () => {
  it.each([true, false])(
    'restricts to the application role (acting alone: %s)',
    (isActingAlone) => {
      expect(
        resolveApplicationRoleRestriction({
          application: { defaultRoleId: 'application-role-id' },
          isActingAlone,
        }),
      ).toEqual({ applicationRoleId: 'application-role-id' });
    },
  );

  it('denies an application acting alone without a role', () => {
    expect(
      resolveApplicationRoleRestriction({
        application: { defaultRoleId: null },
        isActingAlone: true,
      }),
    ).toEqual({ applicationRoleId: null });
  });

  it('adds no restriction for an application without a role acting with another actor', () => {
    expect(
      resolveApplicationRoleRestriction({
        application: { defaultRoleId: null },
        isActingAlone: false,
      }),
    ).toEqual({});
  });

  it('adds no restriction without an application', () => {
    expect(
      resolveApplicationRoleRestriction({
        application: undefined,
        isActingAlone: false,
      }),
    ).toEqual({});
  });
});
