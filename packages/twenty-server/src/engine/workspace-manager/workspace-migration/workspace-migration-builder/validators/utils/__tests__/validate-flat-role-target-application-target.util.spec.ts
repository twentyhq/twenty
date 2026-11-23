import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { validateFlatRoleTargetApplicationTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-role-target-application-target.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'workspace-custom-application-universal-identifier';

const buildFlatApplication = (
  overrides: Pick<FlatApplication, 'id' | 'universalIdentifier' | 'name'> &
    Partial<FlatApplication>,
): FlatApplication =>
  ({
    sourceType: ApplicationRegistrationSourceType.NPM,
    deletedAt: null,
    ...overrides,
  }) as FlatApplication;

const workspaceCustomApplication = buildFlatApplication({
  id: 'workspace-custom-application-id',
  universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  name: 'Workspace',
});

const twentyStandardApplication = buildFlatApplication({
  id: 'twenty-standard-application-id',
  universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
  name: TWENTY_STANDARD_APPLICATION.name,
  sourceType: ApplicationRegistrationSourceType.LOCAL,
});

const installedApplication = buildFlatApplication({
  id: 'installed-application-id',
  universalIdentifier: 'installed-application-universal-identifier',
  name: 'Stripe',
});

const oauthOnlyApplication = buildFlatApplication({
  id: 'oauth-only-application-id',
  universalIdentifier: 'oauth-only-application-universal-identifier',
  name: 'Twenty CLI',
  sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
});

const allFlatApplications = [
  workspaceCustomApplication,
  twentyStandardApplication,
  installedApplication,
  oauthOnlyApplication,
];

const buildOptions: WorkspaceMigrationValidationBuildOptions = {
  isSystemBuild: true,
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  workspaceCustomApplicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  flatApplicationMaps: {
    byId: Object.fromEntries(
      allFlatApplications.map((flatApplication) => [
        flatApplication.id,
        flatApplication,
      ]),
    ),
    idByUniversalIdentifier: Object.fromEntries(
      allFlatApplications.map((flatApplication) => [
        flatApplication.universalIdentifier,
        flatApplication.id,
      ]),
    ),
  },
};

const grantFlatRole = {
  universalIdentifier: 'grant-role-universal-identifier',
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  label: 'Stripe role',
} as UniversalFlatRole;

const buildApplicationFlatRoleTarget = (
  targetApplicationUniversalIdentifier: string,
): UniversalFlatRoleTarget =>
  ({
    universalIdentifier: `${targetApplicationUniversalIdentifier}-role-target`,
    applicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: grantFlatRole.universalIdentifier,
    targetApplicationUniversalIdentifier,
  }) as UniversalFlatRoleTarget;

const emptyFlatRoleTargetMaps = {
  byUniversalIdentifier: {},
} as MetadataUniversalFlatEntityMaps<'roleTarget'>;

const validate = (targetApplicationUniversalIdentifier: string) =>
  validateFlatRoleTargetApplicationTarget({
    flatRole: grantFlatRole,
    flatRoleTarget: buildApplicationFlatRoleTarget(
      targetApplicationUniversalIdentifier,
    ),
    flatRoleTargetMaps: emptyFlatRoleTargetMaps,
    buildOptions,
  });

describe('validateFlatRoleTargetApplicationTarget', () => {
  it('should accept an installed application', () => {
    expect(validate(installedApplication.universalIdentifier)).toEqual([]);
  });

  it('should accept the twenty standard application', () => {
    expect(validate(twentyStandardApplication.universalIdentifier)).toEqual([]);
  });

  it.each([
    ['the workspace custom application', workspaceCustomApplication],
    ['an OAuth-only application', oauthOnlyApplication],
  ])('should reject %s', (_, flatApplication) => {
    expect(validate(flatApplication.universalIdentifier)).toEqual([
      expect.objectContaining({
        code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
      }),
    ]);
  });

  it('should reject a second target for the same application', () => {
    const existingFlatRoleTarget = {
      ...buildApplicationFlatRoleTarget(
        installedApplication.universalIdentifier,
      ),
      universalIdentifier: 'existing-role-target',
    };

    expect(
      validateFlatRoleTargetApplicationTarget({
        flatRole: grantFlatRole,
        flatRoleTarget: buildApplicationFlatRoleTarget(
          installedApplication.universalIdentifier,
        ),
        flatRoleTargetMaps: {
          byUniversalIdentifier: {
            [existingFlatRoleTarget.universalIdentifier]:
              existingFlatRoleTarget,
          },
        } as MetadataUniversalFlatEntityMaps<'roleTarget'>,
        buildOptions,
      }),
    ).toEqual([
      expect.objectContaining({
        code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
      }),
    ]);
  });
});
