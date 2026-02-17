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
const TEST_OBJECT_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();

const TEST_SYSTEM_FIELD_IDS = {
  id: uuidv4(),
  createdAt: uuidv4(),
  updatedAt: uuidv4(),
  deletedAt: uuidv4(),
  createdBy: uuidv4(),
  updatedBy: uuidv4(),
  position: uuidv4(),
  searchVector: uuidv4(),
};

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
      },
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'Test Role',
          description: 'A test role',
        },
      ],
      objects: [
        {
          labelIdentifierFieldMetadataUniversalIdentifier: TEST_FIELD_ID,
          universalIdentifier: TEST_OBJECT_ID,
          nameSingular: 'ticket',
          namePlural: 'tickets',
          labelSingular: 'Ticket',
          labelPlural: 'Tickets',
          description: 'A support ticket',
          icon: 'IconTicket',
          fields: [
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.id,
              type: FieldMetadataType.UUID,
              name: 'id',
              label: 'Id',
              isSystem: true,
            },
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.createdAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'createdAt',
              label: 'Creation date',
            },
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.updatedAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'updatedAt',
              label: 'Last update',
            },
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.deletedAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'deletedAt',
              label: 'Deleted at',
            },
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.createdBy,
              type: FieldMetadataType.ACTOR,
              name: 'createdBy',
              label: 'Created by',
            },
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.updatedBy,
              type: FieldMetadataType.ACTOR,
              name: 'updatedBy',
              label: 'Updated by',
            },
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.position,
              type: FieldMetadataType.POSITION,
              name: 'position',
              label: 'Position',
              isSystem: true,
            },
            {
              universalIdentifier: TEST_SYSTEM_FIELD_IDS.searchVector,
              type: FieldMetadataType.TS_VECTOR,
              name: 'searchVector',
              label: 'Search vector',
              isSystem: true,
            },
          ],
        },
      ],
      fields: [
        {
          universalIdentifier: TEST_FIELD_ID,
          type: FieldMetadataType.TEXT,
          name: 'description',
          label: 'Description',
          description: 'Ticket description',
          icon: 'IconFileDescription',
          objectUniversalIdentifier: TEST_OBJECT_ID,
        },
      ],
      logicFunctions: [],
      frontComponents: [],
      publicAssets: [],
      views: [],
      navigationMenuItems: [],
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
          objectUniversalIdentifier: TEST_OBJECT_ID,
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
