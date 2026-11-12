import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import {
  findApplicationDefaultRoleId,
  findApplicationGrantRole,
  findApplicationIdByUniversalIdentifier,
  findRolePermissionSnapshot,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { type RoleManifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.setTimeout(120000);

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

const buildRequestedRole = (
  overrides: Partial<RoleManifest>,
): RoleManifest => ({
  universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Grant install requested role',
  objectPermissions: [
    {
      objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
      canReadObjectRecords: true,
    },
  ],
  ...overrides,
});

const uploadVersion = async ({
  version,
  requestedRole,
}: {
  version: string;
  requestedRole: RoleManifest;
}) => {
  const tarball = await createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({
        appId: APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { roles: [requestedRole] },
      }),
    ),
    'package.json': JSON.stringify({
      name: `test-application-grant-install-${APPLICATION_UNIVERSAL_IDENTIFIER}`,
      version,
    }),
  });

  const { errors } = await uploadAppTarball({
    tarballBuffer: tarball,
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  expect(errors).toBeUndefined();
};

const install = async (version: string) => {
  const { errors } = await installApplication({
    input: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER, version },
    expectToFail: false,
  });

  expect(errors).toBeUndefined();
};

const expectGrantRoleToMatchRequestedRole = async () => {
  const applicationId = await findApplicationIdByUniversalIdentifier({
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  });

  const grant = await findApplicationGrantRole({
    applicationId: applicationId!,
    workspaceId: SEED_APPLE_WORKSPACE_ID,
  });

  const workspaceCustomApplicationId = await findWorkspaceCustomApplicationId();

  expect(grant?.role.applicationId).toBe(workspaceCustomApplicationId);
  expect(grant?.roleTarget.applicationId).toBe(workspaceCustomApplicationId);

  const grantSnapshot = await findRolePermissionSnapshot(grant!.role.id);

  expect(grantSnapshot).toEqual(
    await findRolePermissionSnapshot(
      await findApplicationDefaultRoleId({ applicationId: applicationId! }),
    ),
  );

  return { grant: grant!, grantSnapshot };
};

describe('Application grant on install and upgrade', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  it('gives an installed application a grant equal to its requested role, then follows it on upgrade', async () => {
    await uploadVersion({
      version: '1.0.0',
      requestedRole: buildRequestedRole({}),
    });
    await install('1.0.0');

    const { grant: installedGrant, grantSnapshot: installedSnapshot } =
      await expectGrantRoleToMatchRequestedRole();

    expect(installedSnapshot.switches.canUpdateAllObjectRecords).toBe(false);
    expect(installedSnapshot.objectPermissions).toHaveLength(1);

    await uploadVersion({
      version: '2.0.0',
      requestedRole: buildRequestedRole({
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        objectPermissions: [],
      }),
    });
    await install('2.0.0');

    const { grant: upgradedGrant, grantSnapshot: upgradedSnapshot } =
      await expectGrantRoleToMatchRequestedRole();

    expect(upgradedGrant.role.id).toBe(installedGrant.role.id);
    expect(upgradedSnapshot.switches.canUpdateAllObjectRecords).toBe(true);
    expect(upgradedSnapshot.objectPermissions).toEqual([]);
  });
});
