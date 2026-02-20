import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_SKILL_ID = uuidv4();

describe('syncApplication - skill', () => {
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

  afterEach(async () => {
    if (!appCreated) {
      return;
    }

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should sync a skill then update it on second sync', async () => {
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
      skills: [
        {
          universalIdentifier: TEST_SKILL_ID,
          name: 'test-skill',
          label: 'Test Skill',
          description: 'A skill for testing',
          icon: 'IconBrain',
          content: '# Test Skill\n\nThis is a test skill.',
        },
      ],
      objects: [],
      fields: [],
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
      skills: [
        {
          universalIdentifier: TEST_SKILL_ID,
          name: 'test-skill',
          label: 'Test Skill Updated',
          description: 'An updated skill for testing',
          icon: 'IconBrain',
          content:
            '# Test Skill\n\nThis is an updated test skill with more content.',
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
