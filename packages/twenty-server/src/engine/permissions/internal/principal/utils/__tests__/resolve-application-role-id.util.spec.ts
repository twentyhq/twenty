import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveApplicationRoleId } from 'src/engine/permissions/internal/principal/utils/resolve-application-role-id.util';

const APPLICATION_ID = 'application-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';

const resolve = ({
  applicationId = APPLICATION_ID,
  defaultRoleId,
  sourceType,
  grantRoleId,
  userRoleId,
}: {
  applicationId?: string;
  defaultRoleId: string | null;
  sourceType: ApplicationRegistrationSourceType;
  grantRoleId?: string;
  userRoleId?: string;
}) =>
  resolveApplicationRoleId({
    application: { id: applicationId, defaultRoleId, sourceType },
    userRoleId,
    workspaceId: 'workspace-id',
    workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    flatRoleTargetByApplicationIdMaps:
      grantRoleId === undefined
        ? {}
        : { [applicationId]: { roleId: grantRoleId } },
  });

describe('resolveApplicationRoleId', () => {
  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])('restricts a %s application to its grant', (sourceType) => {
    expect(
      resolve({
        defaultRoleId: 'application-role-id',
        sourceType,
        grantRoleId: 'grant-role-id',
        userRoleId: 'user-role-id',
      }),
    ).toBe('grant-role-id');
  });

  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])('denies a %s application without a role', (sourceType) => {
    expect(
      resolve({
        defaultRoleId: null,
        sourceType,
        grantRoleId: 'grant-role-id',
      }),
    ).toBeUndefined();
  });

  it('restricts the workspace custom application to its own role', () => {
    expect(
      resolve({
        applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        defaultRoleId: 'custom-application-role-id',
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
    ).toBe('custom-application-role-id');
  });

  it('restricts an OAuth-only application to its role', () => {
    expect(
      resolve({
        defaultRoleId: 'application-role-id',
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    ).toBe('application-role-id');
  });

  it('lends the member role to an OAuth-only application without a role', () => {
    expect(
      resolve({
        defaultRoleId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        userRoleId: 'user-role-id',
      }),
    ).toBe('user-role-id');
  });

  it('denies an OAuth-only application without a role when no member role backs it', () => {
    expect(
      resolve({
        defaultRoleId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    ).toBeUndefined();
  });
});
