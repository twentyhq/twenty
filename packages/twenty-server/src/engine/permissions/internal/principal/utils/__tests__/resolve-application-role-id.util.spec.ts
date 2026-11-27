import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveApplicationRoleId } from 'src/engine/permissions/internal/principal/utils/resolve-application-role-id.util';

const APPLICATION_ID = 'application-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';

const resolve = ({
  applicationId = APPLICATION_ID,
  requestedRoleId,
  sourceType,
  grantRoleId,
}: {
  applicationId?: string;
  requestedRoleId: string | null;
  sourceType: ApplicationRegistrationSourceType;
  grantRoleId?: string;
}) =>
  resolveApplicationRoleId({
    application: { id: applicationId, requestedRoleId, sourceType },
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
        requestedRoleId: 'application-role-id',
        sourceType,
        grantRoleId: 'grant-role-id',
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
        requestedRoleId: null,
        sourceType,
        grantRoleId: 'grant-role-id',
      }),
    ).toBeUndefined();
  });

  it('restricts the workspace custom application to its own role', () => {
    expect(
      resolve({
        applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        requestedRoleId: 'custom-application-role-id',
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      }),
    ).toBe('custom-application-role-id');
  });

  it('restricts an OAuth-only application to its role', () => {
    expect(
      resolve({
        requestedRoleId: 'application-role-id',
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    ).toBe('application-role-id');
  });

  it('gives no role to an OAuth-only application without one', () => {
    expect(
      resolve({
        requestedRoleId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      }),
    ).toBeUndefined();
  });
});
