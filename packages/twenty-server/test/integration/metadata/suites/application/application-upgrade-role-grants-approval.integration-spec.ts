import { type RoleManifest } from 'twenty-shared/application';
import { applicationUpgradeRoleGrantsQueryFactory } from 'test/integration/metadata/suites/application/utils/application-upgrade-role-grants-query-factory.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { upgradeApplication } from 'test/integration/metadata/suites/application/utils/upgrade-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const APP_UNIVERSAL_IDENTIFIER = '20202020-6b0e-4b1e-9d3a-000000002941';
const ROLE_UNIVERSAL_IDENTIFIER = '20202020-6b0e-4b1e-9d3a-000000002942';

jest.setTimeout(120000);

const buildTarball = ({
  version,
  defaultRole,
}: {
  version: string;
  defaultRole: Partial<RoleManifest>;
}): Promise<Buffer> =>
  createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          roles: [
            {
              universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
              label: 'Test Role',
              ...defaultRole,
            },
          ],
        },
      }),
    ),
    'package.json': JSON.stringify({
      name: 'test-upgrade-role-grants-approval',
      version,
    }),
  });

const findInstalledApplication = async () => {
  const { data } = await findOneApplication({
    input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    gqlFields: 'id version',
    expectToFail: false,
  });

  return data.findOneApplication;
};

describe('Application upgrade widening the default role', () => {
  let appRegistrationId: string;

  beforeAll(async () => {
    jest.useRealTimers();

    const { data } = await uploadAppTarball({
      tarballBuffer: await buildTarball({ version: '1.0.0', defaultRole: {} }),
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    appRegistrationId = data.uploadAppTarball.id;

    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    });

    await uploadAppTarball({
      tarballBuffer: await buildTarball({
        version: '2.0.0',
        defaultRole: { canReadAllObjectRecords: true },
      }),
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  it('lists the grants the latest version adds to the default role', async () => {
    const { id } = await findInstalledApplication();

    const response = await makeMetadataApiRequest(
      applicationUpgradeRoleGrantsQueryFactory({ applicationId: id }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.applicationUpgradeRoleGrants).toEqual([
      expect.objectContaining({
        type: 'ALL_OBJECT_RECORDS',
        action: 'canReadObjectRecords',
      }),
    ]);
  });

  it('refuses the upgrade without approval and keeps the installed version', async () => {
    const { errors } = await upgradeApplication({
      input: { appRegistrationId, targetVersion: '2.0.0' },
      expectToFail: true,
    });

    expect(errors[0].extensions.subCode).toBe(
      'UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL',
    );
    expect((await findInstalledApplication()).version).toBe('1.0.0');
  });

  it('refuses an install that is an upgrade, since it cannot carry an approval', async () => {
    const { errors } = await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
      expectToFail: true,
    });

    expect(errors[0].extensions.subCode).toBe(
      'UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL',
    );
    expect((await findInstalledApplication()).version).toBe('1.0.0');
  });

  it('upgrades once the grants are approved for the latest version', async () => {
    await upgradeApplication({
      input: {
        appRegistrationId,
        targetVersion: '2.0.0',
        hasUserApprovedRoleGrants: true,
      },
      expectToFail: false,
    });

    expect((await findInstalledApplication()).version).toBe('2.0.0');
  });
});
