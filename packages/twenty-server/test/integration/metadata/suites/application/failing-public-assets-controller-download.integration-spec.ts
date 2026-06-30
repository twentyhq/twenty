import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_UID = uuidv4();
const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const UNKNOWN_WORKSPACE_ID = uuidv4();
const UNKNOWN_APPLICATION_ID = uuidv4();

const PUBLIC_ASSET_PATH = 'assets/logo.svg';
const PUBLIC_ASSET_CONTENT = '<svg><circle r="10" /></svg>';
const PERSISTED_PUBLIC_ASSET_CONTENT = '<svg><circle r="10"></circle></svg>';
const PUBLIC_ASSET_CONTENT_TYPE = 'image/svg+xml';

type FailingCase = {
  buildUrl: (validApplicationId: string) => string;
};

const FAILING_CASES: EachTestingContext<FailingCase>[] = [
  {
    title: 'when path contains a leading parent-directory segment (..)',
    context: {
      buildUrl: (applicationId) =>
        `/public-assets/${TEST_WORKSPACE_ID}/${applicationId}/..`,
    },
  },
  {
    title: 'when path contains multiple upward traversal segments (../../)',
    context: {
      buildUrl: (applicationId) =>
        `/public-assets/${TEST_WORKSPACE_ID}/${applicationId}/../../sensitive-file`,
    },
  },
  {
    title: 'when path attempts to escape into another file folder',
    context: {
      buildUrl: (applicationId) =>
        `/public-assets/${TEST_WORKSPACE_ID}/${applicationId}/../workflow/secret.json`,
    },
  },
  {
    title: 'when path contains URL-encoded backslash traversal',
    context: {
      buildUrl: (applicationId) =>
        `/public-assets/${TEST_WORKSPACE_ID}/${applicationId}/..%5C..%5Cetc%5Cpasswd`,
    },
  },
  {
    title: 'when the requested asset does not exist',
    context: {
      buildUrl: (applicationId) =>
        `/public-assets/${TEST_WORKSPACE_ID}/${applicationId}/assets/does-not-exist.svg`,
    },
  },
  {
    title: 'when the workspaceId does not match any workspace',
    context: {
      buildUrl: (applicationId) =>
        `/public-assets/${UNKNOWN_WORKSPACE_ID}/${applicationId}/${PUBLIC_ASSET_PATH}`,
    },
  },
  {
    title: 'when the applicationId does not match any application',
    context: {
      buildUrl: () =>
        `/public-assets/${TEST_WORKSPACE_ID}/${UNKNOWN_APPLICATION_ID}/${PUBLIC_ASSET_PATH}`,
    },
  },
];

describe('Public assets controller download should fail', () => {
  let applicationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UID,
      name: 'Test Public Assets Download Failure App',
      description: 'App for testing failing public-assets controller downloads',
      sourcePath: 'test-public-assets-download-failure',
    });

    const [{ id }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_UID],
    );

    applicationId = id;

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_UID,
      fileFolder: 'PublicAsset',
      filePath: PUBLIC_ASSET_PATH,
      fileBuffer: Buffer.from(PUBLIC_ASSET_CONTENT),
      filename: 'logo.svg',
      contentType: PUBLIC_ASSET_CONTENT_TYPE,
      expectToFail: false,
    });

    jest.useFakeTimers();
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UID,
    });
  });

  it.each(eachTestingContextFilter(FAILING_CASES))(
    '$title',
    async ({ context }) => {
      jest.useRealTimers();

      const response = await request(global.app.getHttpServer()).get(
        context.buildUrl(applicationId),
      );

      jest.useFakeTimers();

      // The legitimate asset content must never leak through a failure path.
      expect(response.text).not.toContain(PERSISTED_PUBLIC_ASSET_CONTENT);

      expectOneNotInternalServerErrorHttpResponseSnapshot({
        status: response.status,
        body: response.body,
      });
    },
    30000,
  );
});
