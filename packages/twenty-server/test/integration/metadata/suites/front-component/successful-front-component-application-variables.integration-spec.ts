import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponent } from 'test/integration/metadata/suites/front-component/utils/find-front-component.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const FRONT_COMPONENT_ID = uuidv4();
const PUBLIC_VARIABLE_ID = uuidv4();
const SECRET_VARIABLE_ID = uuidv4();

const BUILT_COMPONENT_PATH = 'src/front-components/variables.mjs';
const PUBLIC_VARIABLE_VALUE = 'pk.public-access-token';

const buildManifest = (): Manifest => {
  const baseManifest = buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
  });

  return {
    ...baseManifest,
    application: {
      ...baseManifest.application,
      applicationVariables: {
        PUBLIC_ACCESS_TOKEN: {
          universalIdentifier: PUBLIC_VARIABLE_ID,
          value: PUBLIC_VARIABLE_VALUE,
        },
        API_SECRET: {
          universalIdentifier: SECRET_VARIABLE_ID,
          isSecret: true,
        },
      },
    },
    frontComponents: [
      {
        universalIdentifier: FRONT_COMPONENT_ID,
        name: 'VariablesComponent',
        description: 'A front component reading application variables',
        sourceComponentPath: 'src/front-components/variables.tsx',
        builtComponentPath: BUILT_COMPONENT_PATH,
        builtComponentChecksum: 'variables-checksum',
        componentName: 'VariablesComponent',
        isHeadless: false,
      },
    ],
  };
};

describe('Front component application variables', () => {
  let frontComponentId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application Variables App',
      description: 'App for testing front component application variables',
      sourcePath: 'test-application-variables',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: BUILT_COMPONENT_PATH,
      fileBuffer: Buffer.from('dummy built component content'),
      filename: 'variables.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });

    jest.useFakeTimers();

    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    const { data } = await findFrontComponents({});

    const syncedFrontComponent = data.frontComponents.find(
      ({ universalIdentifier }) => universalIdentifier === FRONT_COMPONENT_ID,
    );

    if (!isDefined(syncedFrontComponent)) {
      throw new Error('Synced front component was not found');
    }

    frontComponentId = syncedFrontComponent.id;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should store application variable values encrypted at rest', async () => {
    const rows = await globalThis.testDataSource.query(
      `SELECT key, value FROM core."applicationVariable"
       WHERE "universalIdentifier" = ANY($1)`,
      [[PUBLIC_VARIABLE_ID, SECRET_VARIABLE_ID]],
    );

    const publicVariable = rows.find(
      ({ key }: { key: string }) => key === 'PUBLIC_ACCESS_TOKEN',
    );

    expect(publicVariable.value).toMatch(/^enc:v2:/);
    expect(publicVariable.value).not.toContain(PUBLIC_VARIABLE_VALUE);
  });

  it('should expose non-secret application variables decrypted and exclude secret ones', async () => {
    const { data } = await findFrontComponent({
      input: { id: frontComponentId },
      gqlFields: `
        id
        applicationVariables
      `,
    });

    expect(data.frontComponent.applicationVariables).toEqual({
      PUBLIC_ACCESS_TOKEN: PUBLIC_VARIABLE_VALUE,
    });
  });
});
