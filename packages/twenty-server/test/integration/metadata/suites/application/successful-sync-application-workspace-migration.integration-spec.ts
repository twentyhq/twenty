import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type Manifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_SECOND_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'ticket',
  namePlural: 'tickets',
  labelSingular: 'Ticket',
  labelPlural: 'Tickets',
  description: 'A support ticket',
  icon: 'IconTicket',
});

describe('syncApplication', () => {
  let appCreated = false;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync',
    });

    appCreated = true;
  }, 60000);

  afterAll(async () => {
    if (!appCreated) {
      return;
    }

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should return workspace migration actions on initial sync then on second sync with field rename and new role', async () => {
    const initialManifest: Manifest = {
      application: {
        universalIdentifier: TEST_APP_ID,
        defaultRoleUniversalIdentifier: TEST_ROLE_ID,
        displayName: 'Test Application',
        description: 'A test application for workspace migration',
        icon: 'IconTestPipe',
        applicationVariables: {},
        packageJsonChecksum: null,
        yarnLockChecksum: null,
        apiClientChecksum: null,
      },
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'Test Role',
          description: 'A test role',
        },
      ],
      objects: [TEST_OBJECT],
      fields: [
        {
          universalIdentifier: TEST_FIELD_ID,
          type: FieldMetadataType.TEXT,
          name: 'description',
          label: 'Description',
          description: 'Ticket description',
          icon: 'IconFileDescription',
          objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
        },
      ],
      logicFunctions: [],
      frontComponents: [],
      publicAssets: [],
      views: [],
      navigationMenuItems: [],
      pageLayouts: [],
    };

    const { data: firstSyncData } = await syncApplication({
      manifest: initialManifest,
      expectToFail: false,
    });

    expect(firstSyncData).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstSyncData),
    );

    const updatedManifest: Manifest = {
      ...initialManifest,
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'Test Role',
          description: 'A test role',
        },
        {
          universalIdentifier: TEST_SECOND_ROLE_ID,
          label: 'Viewer Role',
          description: 'A read-only role',
        },
      ],
      fields: [
        {
          universalIdentifier: TEST_FIELD_ID,
          type: FieldMetadataType.TEXT,
          name: 'body',
          label: 'Body',
          description: 'Ticket description',
          icon: 'IconFileDescription',
          objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
        },
      ],
    };

    const { data: secondSyncData } = await syncApplication({
      manifest: updatedManifest,
      expectToFail: false,
    });

    expect(secondSyncData).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(secondSyncData),
    );
  }, 60000);
});
