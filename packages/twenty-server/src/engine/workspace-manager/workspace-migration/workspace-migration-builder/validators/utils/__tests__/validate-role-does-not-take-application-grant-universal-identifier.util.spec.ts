import { getApplicationGrantRoleUniversalIdentifier } from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { validateRoleDoesNotTakeApplicationGrantUniversalIdentifier } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-role-does-not-take-application-grant-universal-identifier.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '2b8e6f4a-1c3d-4e5f-9a7b-6c5d4e3f2a1b';
const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  '7a6b5c4d-3e2f-4a1b-8c9d-0e1f2a3b4c5d';

const installedApplication = {
  id: 'installed-application-id',
  universalIdentifier: INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
} as FlatApplication;

const buildOptions = (
  applicationUniversalIdentifier: string,
  isSystemBuild: boolean,
): WorkspaceMigrationValidationBuildOptions => ({
  isSystemBuild,
  applicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  flatApplicationMaps: {
    byId: { [installedApplication.id]: installedApplication },
    idByUniversalIdentifier: {
      [installedApplication.universalIdentifier]: installedApplication.id,
    },
  },
});

const grantFlatRole = {
  universalIdentifier: getApplicationGrantRoleUniversalIdentifier({
    grantedApplicationUniversalIdentifier:
      INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  }),
};

describe('validateRoleDoesNotTakeApplicationGrantUniversalIdentifier', () => {
  it('should let a system build of the workspace custom application write a grant', () => {
    expect(
      validateRoleDoesNotTakeApplicationGrantUniversalIdentifier({
        flatRole: grantFlatRole,
        buildOptions: buildOptions(
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          true,
        ),
      }),
    ).toEqual([]);
  });

  it.each([
    [
      'an application manifest',
      INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
      true,
    ],
    [
      'a workspace custom application user request',
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      false,
    ],
  ])(
    'should reject a grant identifier taken by %s',
    (_, applicationUniversalIdentifier, isSystemBuild) => {
      expect(
        validateRoleDoesNotTakeApplicationGrantUniversalIdentifier({
          flatRole: grantFlatRole,
          buildOptions: buildOptions(
            applicationUniversalIdentifier,
            isSystemBuild,
          ),
        }),
      ).toEqual([
        expect.objectContaining({
          code: PermissionsExceptionCode.INVALID_SETTING,
        }),
      ]);
    },
  );

  it('should accept any other identifier', () => {
    expect(
      validateRoleDoesNotTakeApplicationGrantUniversalIdentifier({
        flatRole: { universalIdentifier: 'some-role-universal-identifier' },
        buildOptions: buildOptions(
          INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
          true,
        ),
      }),
    ).toEqual([]);
  });
});
