import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromCreateRoleInputToFlatRoleToCreate } from 'src/engine/metadata-modules/flat-role/utils/from-create-role-input-to-flat-role-to-create.util';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TARGET_APPLICATION_UNIVERSAL_IDENTIFIER = v4();

describe('Application role target', () => {
  let workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;
  let workspaceCustomFlatApplication: FlatApplication;
  let targetFlatApplication: FlatApplication;
  let grantFlatRole: FlatRole;
  let flatRoleWithoutApplicationFlag: FlatRole;
  let createdFlatRoleTargets: FlatRoleTarget[] = [];

  const runAsApplication = ({
    applicationUniversalIdentifier,
    flatRolesToCreate = [],
    flatRolesToDelete = [],
    flatRoleTargetsToCreate = [],
    flatRoleTargetsToDelete = [],
  }: {
    applicationUniversalIdentifier: string;
    flatRolesToCreate?: FlatRole[];
    flatRolesToDelete?: FlatRole[];
    flatRoleTargetsToCreate?: FlatRoleTarget[];
    flatRoleTargetsToDelete?: FlatRoleTarget[];
  }) =>
    workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          role: {
            flatEntityToCreate: flatRolesToCreate,
            flatEntityToDelete: flatRolesToDelete,
            flatEntityToUpdate: [],
          },
          roleTarget: {
            flatEntityToCreate: flatRoleTargetsToCreate,
            flatEntityToDelete: flatRoleTargetsToDelete,
            flatEntityToUpdate: [],
          },
        },
      },
    );

  const buildApplicationFlatRoleTarget = ({
    flatRole = grantFlatRole,
    owningFlatApplication = workspaceCustomFlatApplication,
    targetApplication = targetFlatApplication,
  }: {
    flatRole?: FlatRole;
    owningFlatApplication?: FlatApplication;
    targetApplication?: FlatApplication;
  } = {}): FlatRoleTarget => {
    const now = new Date().toISOString();

    return {
      id: v4(),
      universalIdentifier: v4(),
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: owningFlatApplication.id,
      applicationUniversalIdentifier: owningFlatApplication.universalIdentifier,
      roleId: flatRole.id,
      roleUniversalIdentifier: flatRole.universalIdentifier,
      userWorkspaceId: null,
      agentId: null,
      agentUniversalIdentifier: null,
      apiKeyId: null,
      webhookId: null,
      webhookUniversalIdentifier: null,
      targetApplicationId: targetApplication.id,
      targetApplicationUniversalIdentifier:
        targetApplication.universalIdentifier,
      createdAt: now,
      updatedAt: now,
    };
  };

  const buildWorkspaceCustomFlatRole = ({
    label,
    canBeAssignedToApplications,
  }: {
    label: string;
    canBeAssignedToApplications: boolean;
  }): FlatRole => ({
    ...fromCreateRoleInputToFlatRoleToCreate({
      createRoleInput: {
        label,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      flatApplication: workspaceCustomFlatApplication,
    }),
    canBeAssignedToApplications,
  });

  const findTargetApplicationRoleTargets = async () =>
    global.testDataSource.query(
      `SELECT "roleId", "targetApplicationId" FROM "core"."roleTarget"
       WHERE "workspaceId" = $1 AND "targetApplicationId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, targetFlatApplication.id],
    );

  const expectRoleTargetFailure = (
    result: Awaited<ReturnType<typeof runAsApplication>>,
    expectedCode: RoleTargetExceptionCode,
  ) => {
    expect(result.status).toBe('fail');

    if (result.status !== 'fail') {
      return;
    }

    expect(
      result.report.roleTarget.flatMap(({ errors }) =>
        errors.map(({ code }) => code),
      ),
    ).toContain(expectedCode);
  };

  beforeAll(async () => {
    workspaceMigrationValidateBuildAndRunService =
      getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      );

    await setupApplicationForSync({
      applicationUniversalIdentifier: TARGET_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Application role target',
      description: 'Confined application receiving a grant',
      sourcePath: 'test-application-role-target',
    });

    ({ workspaceCustomFlatApplication } =
      await getAppProviderByClassName<ApplicationService>(
        'ApplicationService',
      ).findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }));

    const { flatApplicationMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['flatApplicationMaps']);

    const targetApplicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        TARGET_APPLICATION_UNIVERSAL_IDENTIFIER
      ];
    const targetApplication = isDefined(targetApplicationId)
      ? flatApplicationMaps.byId[targetApplicationId]
      : undefined;

    if (!isDefined(targetApplication)) {
      throw new Error('Target application was not installed');
    }

    targetFlatApplication = targetApplication;

    grantFlatRole = buildWorkspaceCustomFlatRole({
      label: 'Application grant',
      canBeAssignedToApplications: true,
    });
    flatRoleWithoutApplicationFlag = buildWorkspaceCustomFlatRole({
      label: 'Not for applications',
      canBeAssignedToApplications: false,
    });

    const result = await runAsApplication({
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatRolesToCreate: [grantFlatRole, flatRoleWithoutApplicationFlag],
    });

    expect(result.status).toBe('success');
  }, 60000);

  afterAll(async () => {
    await runAsApplication({
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatRolesToDelete: [grantFlatRole, flatRoleWithoutApplicationFlag],
      flatRoleTargetsToDelete: createdFlatRoleTargets,
    });

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TARGET_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should refuse a role that cannot be assigned to applications', async () => {
    expectRoleTargetFailure(
      await runAsApplication({
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatRoleTargetsToCreate: [
          buildApplicationFlatRoleTarget({
            flatRole: flatRoleWithoutApplicationFlag,
          }),
        ],
      }),
      RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
    );
  });

  it('should refuse a grant created by another application', async () => {
    expectRoleTargetFailure(
      await runAsApplication({
        applicationUniversalIdentifier:
          targetFlatApplication.universalIdentifier,
        flatRoleTargetsToCreate: [
          buildApplicationFlatRoleTarget({
            owningFlatApplication: targetFlatApplication,
          }),
        ],
      }),
      RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
    );
  });

  it('should refuse the workspace custom application as target', async () => {
    expectRoleTargetFailure(
      await runAsApplication({
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatRoleTargetsToCreate: [
          buildApplicationFlatRoleTarget({
            targetApplication: workspaceCustomFlatApplication,
          }),
        ],
      }),
      RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
    );
  });

  it('should assign the role to the application, once', async () => {
    const flatRoleTarget = buildApplicationFlatRoleTarget();

    const result = await runAsApplication({
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatRoleTargetsToCreate: [flatRoleTarget],
    });

    expect(result.status).toBe('success');
    createdFlatRoleTargets = [flatRoleTarget];
    expect(await findTargetApplicationRoleTargets()).toEqual([
      {
        roleId: grantFlatRole.id,
        targetApplicationId: targetFlatApplication.id,
      },
    ]);

    expectRoleTargetFailure(
      await runAsApplication({
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatRoleTargetsToCreate: [buildApplicationFlatRoleTarget()],
      }),
      RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
    );
    expect(await findTargetApplicationRoleTargets()).toHaveLength(1);
  });
});
