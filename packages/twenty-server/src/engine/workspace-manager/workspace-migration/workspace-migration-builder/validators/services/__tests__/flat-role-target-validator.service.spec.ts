import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { FlatRoleTargetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-target-validator.service';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const OTHER_CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const OAUTH_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const GRANT_ROLE_UNIVERSAL_IDENTIFIER = v4();
const NOW = new Date().toISOString();

const buildFlatApplication = ({
  universalIdentifier,
  name,
  sourceType = ApplicationRegistrationSourceType.NPM,
}: {
  universalIdentifier: string;
  name: string;
  sourceType?: ApplicationRegistrationSourceType;
}) =>
  ({
    id: v4(),
    universalIdentifier,
    name,
    sourceType,
    deletedAt: null,
  }) as FlatApplication;

const FLAT_APPLICATIONS = [
  buildFlatApplication({
    universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
    name: 'Standard',
    sourceType: ApplicationRegistrationSourceType.LOCAL,
  }),
  buildFlatApplication({
    universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'Custom',
    sourceType: ApplicationRegistrationSourceType.LOCAL,
  }),
  buildFlatApplication({
    universalIdentifier: CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'Confined',
  }),
  buildFlatApplication({
    universalIdentifier: OTHER_CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'Other confined',
  }),
  buildFlatApplication({
    universalIdentifier: OAUTH_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'OAuth only',
    sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
  }),
];

const FLAT_APPLICATION_MAPS: FlatApplicationCacheMaps = {
  byId: Object.fromEntries(
    FLAT_APPLICATIONS.map((flatApplication) => [
      flatApplication.id,
      flatApplication,
    ]),
  ),
  idByUniversalIdentifier: Object.fromEntries(
    FLAT_APPLICATIONS.map(({ id, universalIdentifier }) => [
      universalIdentifier,
      id,
    ]),
  ),
};

const buildGrantRole = (
  overrides: Partial<UniversalFlatRole> = {},
): UniversalFlatRole => ({
  ...fromRoleManifestToUniversalFlatRole({
    roleManifest: {
      universalIdentifier: GRANT_ROLE_UNIVERSAL_IDENTIFIER,
      label: 'Confined grant',
    },
    applicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  }),
  canBeAssignedToApplications: true,
  ...overrides,
});

const buildApplicationRoleTarget = (
  overrides: Partial<UniversalFlatRoleTarget> = {},
): UniversalFlatRoleTarget => ({
  universalIdentifier: v4(),
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  roleUniversalIdentifier: GRANT_ROLE_UNIVERSAL_IDENTIFIER,
  userWorkspaceId: null,
  agentUniversalIdentifier: null,
  apiKeyId: null,
  webhookUniversalIdentifier: null,
  targetApplicationUniversalIdentifier:
    CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
});

const buildFeatureFlagsMap =
  (): WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'] =>
    Object.values(FeatureFlagKey).reduce(
      (featureFlagsMap, key) => ({ ...featureFlagsMap, [key]: false }),
      {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    );

const validateCreation = ({
  flatRoleTarget,
  flatRole = buildGrantRole(),
  existingFlatRoleTargets = [],
  callerApplicationUniversalIdentifier = WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  flatRoleTarget: UniversalFlatRoleTarget;
  flatRole?: UniversalFlatRole;
  existingFlatRoleTargets?: UniversalFlatRoleTarget[];
  callerApplicationUniversalIdentifier?: string;
}) => {
  const optimisticFlatEntityMapsAndRelatedFlatEntityMaps =
    createEmptyAllFlatEntityMaps();

  addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
    universalFlatEntity: flatRole,
    universalFlatEntityMapsToMutate:
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRoleMaps,
  });

  for (const existingFlatRoleTarget of existingFlatRoleTargets) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: existingFlatRoleTarget,
      universalFlatEntityMapsToMutate:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRoleTargetMaps,
    });
  }

  return new FlatRoleTargetValidatorService().validateFlatRoleTargetCreation({
    flatEntityToValidate: flatRoleTarget,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
    additionalCacheDataMaps: {
      featureFlagsMap: buildFeatureFlagsMap(),
      billingEntitlements: {},
    },
    workspaceId: v4(),
    buildOptions: {
      isSystemBuild: true,
      applicationUniversalIdentifier: callerApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatApplicationMaps: FLAT_APPLICATION_MAPS,
    },
  });
};

const errorCodes = (result: ReturnType<typeof validateCreation>) =>
  result.errors.map(({ code }) => code);

describe('FlatRoleTargetValidatorService application targets', () => {
  it('should accept a grant from the workspace custom application to a confined application', () => {
    expect(
      validateCreation({ flatRoleTarget: buildApplicationRoleTarget() }).errors,
    ).toEqual([]);
  });

  it('should refuse a role that cannot be assigned to applications', () => {
    expect(
      errorCodes(
        validateCreation({
          flatRoleTarget: buildApplicationRoleTarget(),
          flatRole: buildGrantRole({ canBeAssignedToApplications: false }),
        }),
      ),
    ).toEqual([RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY]);
  });

  it('should refuse a role the workspace custom application does not own', () => {
    expect(
      errorCodes(
        validateCreation({
          flatRoleTarget: buildApplicationRoleTarget(),
          flatRole: buildGrantRole({
            applicationUniversalIdentifier:
              CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
          }),
        }),
      ),
    ).toEqual([RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY]);
  });

  it('should refuse a target created by another application', () => {
    expect(
      errorCodes(
        validateCreation({
          flatRoleTarget: buildApplicationRoleTarget({
            applicationUniversalIdentifier:
              OTHER_CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
          }),
          callerApplicationUniversalIdentifier:
            OTHER_CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ),
    ).toEqual([RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY]);
  });

  it.each([
    [
      'the standard application',
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    ],
    [
      'the workspace custom application',
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    ],
    ['an OAuth-only application', OAUTH_ONLY_APPLICATION_UNIVERSAL_IDENTIFIER],
  ])(
    'should refuse %s as target',
    (_, targetApplicationUniversalIdentifier) => {
      expect(
        errorCodes(
          validateCreation({
            flatRoleTarget: buildApplicationRoleTarget({
              targetApplicationUniversalIdentifier,
            }),
          }),
        ),
      ).toEqual([RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY]);
    },
  );

  it('should refuse an unknown target application', () => {
    expect(
      errorCodes(
        validateCreation({
          flatRoleTarget: buildApplicationRoleTarget({
            targetApplicationUniversalIdentifier: v4(),
          }),
        }),
      ),
    ).toEqual([RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA]);
  });

  it('should refuse a second target for the same application', () => {
    const result = validateCreation({
      flatRoleTarget: buildApplicationRoleTarget(),
      existingFlatRoleTargets: [buildApplicationRoleTarget()],
    });

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
        message: 'Application already has a role assigned',
      }),
    ]);
  });

  it('should refuse a target with both an application and an agent', () => {
    expect(
      errorCodes(
        validateCreation({
          flatRoleTarget: buildApplicationRoleTarget({
            agentUniversalIdentifier: v4(),
          }),
        }),
      ),
    ).toContain(RoleTargetExceptionCode.ROLE_TARGET_MISSING_IDENTIFIER);
  });
});
