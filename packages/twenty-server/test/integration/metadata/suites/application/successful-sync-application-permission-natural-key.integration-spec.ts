import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const FIRST_PERMISSION_ID = uuidv4();
const REMINTED_PERMISSION_ID = uuidv4();

const ticketObject = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'naturalKeyTicket',
  namePlural: 'naturalKeyTickets',
  labelSingular: 'Natural Key Ticket',
  labelPlural: 'Natural Key Tickets',
  description: 'A support ticket',
});

const buildManifest = ({
  permissionUniversalIdentifier,
  canUpdateObjectRecords,
}: {
  permissionUniversalIdentifier: string;
  canUpdateObjectRecords: boolean;
}) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [ticketObject],
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'Natural Key Role',
          description: 'Role with an object permission',
          objectPermissions: [
            {
              universalIdentifier: permissionUniversalIdentifier,
              objectUniversalIdentifier: ticketObject.universalIdentifier,
              canReadObjectRecords: true,
              canUpdateObjectRecords,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        },
      ],
    },
  });

const findAppRole = async () => {
  const { data } = await findRoles({
    gqlFields:
      'id universalIdentifier objectPermissions { objectMetadataId canReadObjectRecords canUpdateObjectRecords }',
    expectToFail: false,
  });

  const role = data.getRoles.find(
    (candidate) => candidate.universalIdentifier === TEST_ROLE_ID,
  );

  expect(role).toBeDefined();

  return role!;
};

describe('Manifest sync - permission natural keys', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Permission Natural Key Test Application',
      description: 'App for testing permission natural-key matching',
      sourcePath: 'permission-natural-key-manifest-sync',
    });

    await syncApplication({
      manifest: buildManifest({
        permissionUniversalIdentifier: FIRST_PERMISSION_ID,
        canUpdateObjectRecords: false,
      }),
      expectToFail: false,
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('updates the existing object permission when the manifest re-mints its identifier', async () => {
    const remintedSync = await syncApplication({
      manifest: buildManifest({
        permissionUniversalIdentifier: REMINTED_PERMISSION_ID,
        canUpdateObjectRecords: true,
      }),
      expectToFail: false,
    });

    expect(remintedSync.errors).toBeUndefined();

    const role = await findAppRole();

    expect(role.objectPermissions).toHaveLength(1);
    expect(role.objectPermissions?.[0]).toMatchObject({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    });

    const planWithOriginalIdentifier = await syncApplication({
      manifest: buildManifest({
        permissionUniversalIdentifier: FIRST_PERMISSION_ID,
        canUpdateObjectRecords: true,
      }),
      dryRun: true,
      expectToFail: false,
    });

    expect(planWithOriginalIdentifier.data.syncApplication.actions).toEqual([]);
  }, 60000);
});
