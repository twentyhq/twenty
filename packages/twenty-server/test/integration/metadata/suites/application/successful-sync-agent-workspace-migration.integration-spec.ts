import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_AGENT_ID = uuidv4();

describe('syncApplication - agent', () => {
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

  it('should sync an agent then update it on second sync', async () => {
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
      agents: [
        {
          universalIdentifier: TEST_AGENT_ID,
          name: 'test-agent',
          label: 'Test Agent',
          description: 'An agent for testing',
          icon: 'IconRobot',
          prompt: 'You are a helpful test assistant.',
          modelId: 'gpt-4o',
          responseFormat: { type: 'text' },
          evaluationInputs: ['test input 1'],
        },
      ],
      roles: [
        {
          universalIdentifier: TEST_ROLE_ID,
          label: 'Test Role',
          description: 'A test role',
        },
      ],
      skills: [],
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
      agents: [
        {
          universalIdentifier: TEST_AGENT_ID,
          name: 'test-agent',
          label: 'Test Agent Updated',
          description: 'An updated agent for testing',
          icon: 'IconRobot',
          prompt:
            'You are an updated helpful test assistant with more capabilities.',
          modelId: 'gpt-4o',
          responseFormat: { type: 'text' },
          evaluationInputs: ['test input 1', 'test input 2'],
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
