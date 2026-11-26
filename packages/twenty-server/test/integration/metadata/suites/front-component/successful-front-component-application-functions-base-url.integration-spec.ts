import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { findFrontComponentQueryFactory } from 'test/integration/metadata/suites/front-component/utils/find-front-component-query-factory.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  deletePublicDomains,
  insertPublicDomain,
} from 'test/integration/route-trigger/utils/public-domain-rows.util';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const FRONT_COMPONENT_ID = uuidv4();
const BUILT_COMPONENT_PATH = 'src/front-components/functions-url.mjs';

const buildManifest = (): Manifest => ({
  ...buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID }),
  frontComponents: [
    {
      universalIdentifier: FRONT_COMPONENT_ID,
      name: 'FunctionsUrlComponent',
      description: 'A front component calling its application routes',
      sourceComponentPath: 'src/front-components/functions-url.tsx',
      builtComponentPath: BUILT_COMPONENT_PATH,
      builtComponentChecksum: 'functions-url-checksum',
      componentName: 'FunctionsUrlComponent',
      isHeadless: false,
    },
  ],
});

describe('Front component application functions base URL', () => {
  let frontComponentId: string;
  let applicationId: string;

  const requestApplicationFunctionsBaseUrl = async () => {
    const response = await makeMetadataApiRequest(
      findFrontComponentQueryFactory({
        input: { id: frontComponentId },
        gqlFields: `
          id
          applicationFunctionsBaseUrl
        `,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.frontComponent.applicationFunctionsBaseUrl;
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Functions Base Url App',
      description: 'App for testing the front component functions base URL',
      sourcePath: 'test-functions-base-url',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: BUILT_COMPONENT_PATH,
      fileBuffer: Buffer.from('dummy built component content'),
      filename: 'functions-url.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });

    jest.useFakeTimers();

    await syncApplication({ manifest: buildManifest(), expectToFail: false });

    jest.useRealTimers();

    const { data } = await findFrontComponents({});

    const syncedFrontComponent = data.frontComponents.find(
      ({ universalIdentifier }) => universalIdentifier === FRONT_COMPONENT_ID,
    );

    if (!isDefined(syncedFrontComponent)) {
      throw new Error('Synced front component was not found');
    }

    frontComponentId = syncedFrontComponent.id;
    applicationId = syncedFrontComponent.applicationId;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('points at the validated public domain of the application', async () => {
    const publicDomain = `${uuidv4()}.example.com`;

    try {
      await insertPublicDomain({
        domain: publicDomain,
        isValidated: true,
        applicationId,
      });

      expect(await requestApplicationFunctionsBaseUrl()).toBe(
        `https://${publicDomain}`,
      );
    } finally {
      await deletePublicDomains([publicDomain]);
    }
  });

  it('ignores a public domain that is not validated yet', async () => {
    const publicDomain = `${uuidv4()}.example.com`;

    try {
      await insertPublicDomain({
        domain: publicDomain,
        isValidated: false,
        applicationId,
      });

      expect(await requestApplicationFunctionsBaseUrl()).not.toBe(
        `https://${publicDomain}`,
      );
    } finally {
      await deletePublicDomains([publicDomain]);
    }
  });

  it('does not use a validated public domain of another application', async () => {
    const otherApplicationPublicDomain = `${uuidv4()}.example.com`;
    const [{ id: otherApplicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application"
         WHERE "workspaceId" = $1 AND id != $2
         LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID, applicationId],
    );

    try {
      await insertPublicDomain({
        domain: otherApplicationPublicDomain,
        isValidated: true,
        applicationId: otherApplicationId,
      });

      expect(await requestApplicationFunctionsBaseUrl()).not.toBe(
        `https://${otherApplicationPublicDomain}`,
      );
    } finally {
      await deletePublicDomains([otherApplicationPublicDomain]);
    }
  });
});
