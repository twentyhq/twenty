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
    ).toEqual({ applicationRoleId: 'application-role-id' });
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
    ).toEqual({ applicationRoleId: null });
  });

  it('adds no restriction for an OAuth-only application without a role', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          defaultRoleId: null,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
      }),
    ).toEqual({});
  });

  it('adds no restriction without an application', () => {
    expect(resolveApplicationRoleId({ application: undefined })).toEqual({});
  });
});
