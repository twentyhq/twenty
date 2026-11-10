import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { findApplicationIdByUniversalIdentifier } from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import { type PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { getPermissionsPrincipalsActingApplicationId } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-acting-application-id.util';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

jest.setTimeout(240000);

const CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const CONFINED_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const CONFINED_AGENT_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();
const CONFINED_AGENT_UNIVERSAL_IDENTIFIER = uuidv4();
const CONFINED_OBJECT_UNIVERSAL_IDENTIFIER = uuidv4();
const LOCAL_APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const LOCAL_ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

const workspace = { id: SEED_APPLE_WORKSPACE_ID };

const buildConfinedManifest = (): Manifest =>
  buildBaseManifest({
    appId: CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
    roleId: CONFINED_ROLE_UNIVERSAL_IDENTIFIER,
    overrides: {
      roles: [
        {
          universalIdentifier: CONFINED_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Grant resolution requested role',
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        },
        {
          universalIdentifier: CONFINED_AGENT_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Grant resolution agent role',
          canReadAllObjectRecords: true,
          canBeAssignedToAgents: true,
        },
      ],
      agents: [
        {
          universalIdentifier: CONFINED_AGENT_UNIVERSAL_IDENTIFIER,
          name: 'grant-resolution-agent',
          label: 'Grant resolution agent',
          prompt: 'You read records.',
          roleUniversalIdentifier: CONFINED_AGENT_ROLE_UNIVERSAL_IDENTIFIER,
        },
      ],
      objects: [
        {
          ...buildDefaultObjectManifest({
            universalIdentifier: CONFINED_OBJECT_UNIVERSAL_IDENTIFIER,
            nameSingular: 'grantResolutionInvoice',
            namePlural: 'grantResolutionInvoices',
            labelSingular: 'Grant resolution invoice',
            labelPlural: 'Grant resolution invoices',
            applicationUniversalIdentifier:
              CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
          }),
          disabledObjectPermissionActions: ['canDestroyObjectRecords'],
        },
      ],
    },
  });

const installConfinedApplication = async () => {
  const tarball = await createAppTarball({
    'manifest.json': JSON.stringify(buildConfinedManifest()),
    'package.json': JSON.stringify({
      name: `test-application-grant-resolution-${CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER}`,
      version: '1.0.0',
    }),
  });

  const { errors: uploadErrors } = await uploadAppTarball({
    tarballBuffer: tarball,
    universalIdentifier: CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  expect(uploadErrors).toBeUndefined();

  const { errors: installErrors } = await installApplication({
    input: {
      universalIdentifier: CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
      version: '1.0.0',
    },
    expectToFail: false,
  });

  expect(installErrors).toBeUndefined();
};

const syncLocalApplication = async () => {
  await setupApplicationForSync({
    applicationUniversalIdentifier: LOCAL_APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'Grant resolution local application',
    description: 'Local application of the grant resolution suite',
    sourcePath: 'test-application-grant-resolution-local',
  });

  await syncApplication({
    manifest: buildBaseManifest({
      appId: LOCAL_APPLICATION_UNIVERSAL_IDENTIFIER,
      roleId: LOCAL_ROLE_UNIVERSAL_IDENTIFIER,
      overrides: {
        roles: [
          {
            universalIdentifier: LOCAL_ROLE_UNIVERSAL_IDENTIFIER,
            label: 'Grant resolution local role',
            canReadAllObjectRecords: true,
          },
        ],
      },
    }),
    expectToFail: false,
  });
};

const findApplicationIdOrThrow = async (universalIdentifier: string) => {
  const applicationId = await findApplicationIdByUniversalIdentifier({
    universalIdentifier,
  });

  if (!isDefined(applicationId)) {
    throw new Error(`Application ${universalIdentifier} is not installed`);
  }

  return applicationId;
};

const findAgentIdOrThrow = async (universalIdentifier: string) => {
  const [agent] = await globalThis.testDataSource.query(
    `SELECT id FROM core."agent" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  if (!isDefined(agent)) {
    throw new Error(`Agent ${universalIdentifier} is not synced`);
  }

  return agent.id as string;
};

const findObjectMetadataIdOrThrow = async (universalIdentifier: string) => {
  const [objectMetadata] = await globalThis.testDataSource.query(
    `SELECT id FROM core."objectMetadata" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  if (!isDefined(objectMetadata)) {
    throw new Error(`Object ${universalIdentifier} is not synced`);
  }

  return objectMetadata.id as string;
};

const invalidateRoleTargets = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatRoleTargetMaps']);

// Removing the grant's role target makes the application fall back to its
// requested role, which is how every application resolved before grants
const withoutGrantRoleTarget = async <TResult>(
  applicationId: string,
  run: () => Promise<TResult>,
): Promise<TResult> => {
  const removedRoleTargets: Record<string, unknown>[] =
    await globalThis.testDataSource.query(
      `SELECT * FROM core."roleTarget"
       WHERE "targetApplicationId" = $1 AND "workspaceId" = $2`,
      [applicationId, SEED_APPLE_WORKSPACE_ID],
    );

  await globalThis.testDataSource.query(
    `DELETE FROM core."roleTarget"
     WHERE "targetApplicationId" = $1 AND "workspaceId" = $2`,
    [applicationId, SEED_APPLE_WORKSPACE_ID],
  );

  await invalidateRoleTargets();

  try {
    return await run();
  } finally {
    for (const removedRoleTarget of removedRoleTargets) {
      await globalThis.testDataSource.query(
        `INSERT INTO core."roleTarget"
         SELECT * FROM json_populate_record(NULL::core."roleTarget", $1::json)`,
        [JSON.stringify(removedRoleTarget)],
      );
    }

    await invalidateRoleTargets();
  }
};

const resolvePermissions = async (authContext: PermissionsAuthContext) => {
  const principals =
    await getAppProviderByClassName<PrincipalPermissionsReadService>(
      'PrincipalPermissionsReadService',
    ).resolvePermissionsPrincipals({ authContext });

  if (!isDefined(principals)) {
    return { principals: undefined, computed: undefined };
  }

  const recordsPermissions =
    await getAppProviderByClassName<PermissionsMetadataMapsService>(
      'PermissionsMetadataMapsService',
    ).loadRecordsPermissionsForPrincipals({ principals });

  const { flatRoleMaps, flatRolePermissionFlagMaps } =
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
    ]);

  const permissionFlags = Object.fromEntries(
    Object.values(PermissionFlagType).map((permissionFlag) => [
      permissionFlag,
      getPermissionsPrincipalsRoleIds(principals).every((roleId) => {
        const flatRole = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: roleId,
          flatEntityMaps: flatRoleMaps,
        });

        return (
          isDefined(flatRole) &&
          isPermissionFlagGrantedToFlatRole({
            flatRole,
            permissionFlag,
            flatRolePermissionFlagMaps,
          })
        );
      }),
    ]),
  );

  return {
    principals,
    computed: {
      recordsPermissions,
      permissionFlags,
      actingApplicationId: getPermissionsPrincipalsActingApplicationId({
        principals,
      }),
    },
  };
};

const expectSamePermissionsWithAndWithoutGrant = async ({
  applicationId,
  authContext,
}: {
  applicationId: string;
  authContext: PermissionsAuthContext;
}) => {
  const withGrant = await resolvePermissions(authContext);
  const withoutGrant = await withoutGrantRoleTarget(applicationId, () =>
    resolvePermissions(authContext),
  );

  expect(withGrant.computed).toEqual(withoutGrant.computed);

  if (isDefined(withGrant.principals) && isDefined(withoutGrant.principals)) {
    expect(getPermissionsPrincipalsShareKeys(withGrant.principals)).toEqual(
      expect.arrayContaining(
        getPermissionsPrincipalsShareKeys(withoutGrant.principals),
      ),
    );
  }

  return withGrant;
};

const findApplicationPrincipalRoleId = (
  principals: Awaited<ReturnType<typeof resolvePermissions>>['principals'],
) =>
  principals?.applicationPrincipal.type === 'application'
    ? principals.applicationPrincipal.roleId
    : undefined;

const findGrantRoleId = async (applicationId: string) => {
  const [roleTarget] = await globalThis.testDataSource.query(
    `SELECT "roleId" FROM core."roleTarget"
     WHERE "targetApplicationId" = $1 AND "workspaceId" = $2`,
    [applicationId, SEED_APPLE_WORKSPACE_ID],
  );

  return roleTarget?.roleId as string | undefined;
};

const memberActingThrough = (
  applicationId: string,
): PermissionsAuthContext => ({
  type: 'user',
  workspace,
  workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
  application: { id: applicationId },
});

const applicationActingAlone = (
  applicationId: string,
  agentId?: string,
): PermissionsAuthContext => ({
  type: 'application',
  workspace,
  application: { id: applicationId },
  ...(isDefined(agentId) ? { agentId } : {}),
});

describe('Application grant permission resolution', () => {
  let confinedApplicationId: string;
  let confinedAgentId: string;
  let confinedObjectMetadataId: string;
  let localApplicationId: string;

  beforeAll(async () => {
    jest.useRealTimers();

    await installConfinedApplication();
    await syncLocalApplication();

    confinedApplicationId = await findApplicationIdOrThrow(
      CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    confinedAgentId = await findAgentIdOrThrow(
      CONFINED_AGENT_UNIVERSAL_IDENTIFIER,
    );
    confinedObjectMetadataId = await findObjectMetadataIdOrThrow(
      CONFINED_OBJECT_UNIVERSAL_IDENTIFIER,
    );
    localApplicationId = await findApplicationIdOrThrow(
      LOCAL_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: CONFINED_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: LOCAL_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  describe('a confined application', () => {
    it('runs with its grant when acting alone, with unchanged permissions', async () => {
      const { principals } = await expectSamePermissionsWithAndWithoutGrant({
        applicationId: confinedApplicationId,
        authContext: applicationActingAlone(confinedApplicationId),
      });

      expect(findApplicationPrincipalRoleId(principals)).toBe(
        await findGrantRoleId(confinedApplicationId),
      );
    });

    it('keeps its rights on its own objects through disabled actions', async () => {
      const { computed } = await expectSamePermissionsWithAndWithoutGrant({
        applicationId: confinedApplicationId,
        authContext: applicationActingAlone(confinedApplicationId),
      });

      expect(
        computed?.recordsPermissions.objects[confinedObjectMetadataId]
          ?.canDestroyAllRecords,
      ).toBe(true);
    });

    it('has unchanged permissions when acting for a member', async () => {
      const { computed } = await expectSamePermissionsWithAndWithoutGrant({
        applicationId: confinedApplicationId,
        authContext: memberActingThrough(confinedApplicationId),
      });

      expect(computed?.actingApplicationId).toBe(confinedApplicationId);
    });

    it('has unchanged permissions for its agent', async () => {
      const { computed } = await expectSamePermissionsWithAndWithoutGrant({
        applicationId: confinedApplicationId,
        authContext: applicationActingAlone(
          confinedApplicationId,
          confinedAgentId,
        ),
      });

      expect(computed).toBeDefined();
    });

    it('falls back to its requested role once its grant role target is removed', async () => {
      const [{ defaultRoleId }] = await globalThis.testDataSource.query(
        `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
        [confinedApplicationId],
      );

      const { principals } = await withoutGrantRoleTarget(
        confinedApplicationId,
        () => resolvePermissions(applicationActingAlone(confinedApplicationId)),
      );

      expect(findApplicationPrincipalRoleId(principals)).toBe(defaultRoleId);
    });
  });

  it('has unchanged permissions for a LOCAL application', async () => {
    const { principals } = await expectSamePermissionsWithAndWithoutGrant({
      applicationId: localApplicationId,
      authContext: applicationActingAlone(localApplicationId),
    });

    expect(findApplicationPrincipalRoleId(principals)).toBe(
      await findGrantRoleId(localApplicationId),
    );
  });

  it('has unchanged permissions for twenty-standard acting for an Admin member', async () => {
    const twentyStandardApplicationId = await findApplicationIdOrThrow(
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    const { computed } = await expectSamePermissionsWithAndWithoutGrant({
      applicationId: twentyStandardApplicationId,
      authContext: memberActingThrough(twentyStandardApplicationId),
    });

    expect(computed?.actingApplicationId).toBeUndefined();
  });

  it('keeps the workspace custom application on its own role', async () => {
    const workspaceCustomApplicationId =
      await findWorkspaceCustomApplicationId();

    const { principals } = await expectSamePermissionsWithAndWithoutGrant({
      applicationId: workspaceCustomApplicationId,
      authContext: applicationActingAlone(workspaceCustomApplicationId),
    });

    const [{ defaultRoleId }] = await globalThis.testDataSource.query(
      `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
      [workspaceCustomApplicationId],
    );

    expect(findApplicationPrincipalRoleId(principals)).toBe(defaultRoleId);
  });

  describe('an OAuth-only application', () => {
    let cliApplicationId: string;

    beforeAll(async () => {
      await loginAsTwentyCli();

      cliApplicationId = await findApplicationIdOrThrow(
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      );
    });

    afterAll(async () => {
      await uninstallApplication({
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        expectToFail: false,
      });
    });

    it('acts with the member role, unchanged', async () => {
      const { principals } = await expectSamePermissionsWithAndWithoutGrant({
        applicationId: cliApplicationId,
        authContext: memberActingThrough(cliApplicationId),
      });

      expect(findApplicationPrincipalRoleId(principals)).toBe(
        principals?.mainPrincipal.roleId,
      );
    });

    it('gets no access acting alone', async () => {
      const { principals } = await resolvePermissions(
        applicationActingAlone(cliApplicationId),
      );

      expect(principals).toBeUndefined();
    });
  });
});
