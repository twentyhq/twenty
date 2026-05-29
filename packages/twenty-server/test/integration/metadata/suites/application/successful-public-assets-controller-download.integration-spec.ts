import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_UID = uuidv4();
const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const PUBLIC_ASSET_PATH = 'assets/logo.svg';
const PUBLIC_ASSET_CONTENT = '<svg><circle r="10" /></svg>';
const EXPECTED_SANITIZED_PUBLIC_ASSET_CONTENT =
  '<svg><circle r="10"></circle></svg>';
const PUBLIC_ASSET_CONTENT_TYPE = 'image/svg+xml';

describe('Public assets controller download should succeed', () => {
  let applicationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UID,
      name: 'Test Public Assets Download Success App',
      description:
        'App for testing successful public-assets controller downloads',
      sourcePath: 'test-public-assets-download-success',
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

  it('should stream a public asset with the correct headers and body', async () => {
    jest.useRealTimers();

    // `image/svg+xml` is treated as binary by superagent: the bytes land in
    // `response.body` as a Buffer, and `response.text` stays undefined.
    const response = await request(global.app.getHttpServer())
      .get(
        `/public-assets/${TEST_WORKSPACE_ID}/${applicationId}/${PUBLIC_ASSET_PATH}`,
      )
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    jest.useFakeTimers();

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain(
      PUBLIC_ASSET_CONTENT_TYPE,
    );
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect((response.body as Buffer).toString('utf-8')).toBe(
      EXPECTED_SANITIZED_PUBLIC_ASSET_CONTENT,
    );
  }, 30000);
});
