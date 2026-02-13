import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { createOneApplication } from 'test/integration/metadata/suites/application/utils/create-one-application.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

describe('syncApplication', () => {
  let appCreated = false;

  beforeAll(async () => {
    await createOneApplication({
      universalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'A test application',
      version: '1.0.0',
      sourcePath: 'test-sync',
      expectToFail: false,
    });

    appCreated = true;

    // File upload uses multipart which requires real timers
    jest.useRealTimers();

    const packageJson = JSON.stringify({
      name: 'test-application',
      version: '1.0.0',
    });

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'Dependencies',
      filePath: 'package.json',
      fileBuffer: Buffer.from(packageJson),
      filename: 'package.json',
      expectToFail: false,
    });

    jest.useFakeTimers();
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

  it('should return workspace migration with actions when syncing a manifest with a role', async () => {
    const manifest: Manifest = {
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
      objects: [],
      fields: [],
      logicFunctions: [],
      frontComponents: [],
      publicAssets: [],
    };

    const { data, errors } = await syncApplication({
      manifest,
      expectToFail: false,
    });

    expect(data).toMatchInlineSnapshot(`
{
  "syncApplication": {
    "actions": [
      {
        "flatEntity": {
          "applicationUniversalIdentifier": "809aca3b-0567-4c61-9937-bc49f8082d4b",
          "canAccessAllTools": false,
          "canBeAssignedToAgents": true,
          "canBeAssignedToApiKeys": true,
          "canBeAssignedToUsers": true,
          "canDestroyAllObjectRecords": false,
          "canReadAllObjectRecords": false,
          "canSoftDeleteAllObjectRecords": false,
          "canUpdateAllObjectRecords": false,
          "canUpdateAllSettings": false,
          "createdAt": "2026-02-13T13:02:17.820Z",
          "description": "A test role",
          "icon": null,
          "isEditable": true,
          "label": "Test Role",
          "roleTargetUniversalIdentifiers": [],
          "rowLevelPermissionPredicateGroupUniversalIdentifiers": [],
          "rowLevelPermissionPredicateUniversalIdentifiers": [],
          "universalIdentifier": "a3932200-c9f1-49e0-b303-093f585f7818",
          "updatedAt": "2026-02-13T13:02:17.820Z",
        },
        "metadataName": "role",
        "type": "create",
      },
    ],
    "applicationUniversalIdentifier": "809aca3b-0567-4c61-9937-bc49f8082d4b",
  },
}
`);
  }, 60000);
});
