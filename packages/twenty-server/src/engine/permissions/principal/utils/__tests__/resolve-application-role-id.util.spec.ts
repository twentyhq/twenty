import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveApplicationRoleId } from 'src/engine/permissions/principal/utils/resolve-application-role-id.util';

describe('resolveApplicationRoleId', () => {
  it.each([
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
  ])('restricts to the role of a %s application', (sourceType) => {
    expect(
      resolveApplicationRoleId({
        application: { defaultRoleId: 'application-role-id', sourceType },
      }),
    ).toBe('application-role-id');
  });

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])('denies a %s application without a role', (sourceType) => {
    expect(
      resolveApplicationRoleId({
        application: { defaultRoleId: null, sourceType },
      }),
    ).toBeUndefined();
  });

  it('lends the member role to an OAuth-only application without a role', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          defaultRoleId: null,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
        userRoleId: 'user-role-id',
      }),
    ).toBe('user-role-id');
  });

  it('denies an OAuth-only application without a role when no member role backs it', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          defaultRoleId: null,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
      }),
    ).toBeUndefined();
  });
});
