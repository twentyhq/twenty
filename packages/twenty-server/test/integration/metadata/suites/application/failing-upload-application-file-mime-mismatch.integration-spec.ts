import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();

const PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);
const TEXT_BUFFER = Buffer.from('not actually binary content', 'utf-8');

type TestContext = {
  applicationUniversalIdentifier: string;
  fileFolder: string;
  filePath: string;
  fileBuffer: Buffer;
  filename: string;
  contentType: string;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title:
      'when a PublicAsset .png path is uploaded with plain text body (magic-byte mismatch)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'PublicAsset',
      filePath: 'assets/fake-image.png',
      fileBuffer: TEXT_BUFFER,
      filename: 'fake-image.png',
      contentType: 'image/png',
    },
  },
  {
    title:
      'when a PublicAsset .pdf path is uploaded with plain text body (magic-byte mismatch)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'PublicAsset',
      filePath: 'docs/fake.pdf',
      fileBuffer: TEXT_BUFFER,
      filename: 'fake.pdf',
      contentType: 'application/pdf',
    },
  },
  {
    title:
      'when a PublicAsset .zip path is uploaded with plain text body (magic-byte mismatch)',
    context: {
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'PublicAsset',
      filePath: 'archives/fake.zip',
      fileBuffer: TEXT_BUFFER,
      filename: 'fake.zip',
      contentType: 'application/zip',
    },
  },
];

describe('Upload application file should fail on mime/magic-byte mismatch', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Upload Mime Mismatch App',
      description: 'App for testing magic-byte vs extension validation',
      sourcePath: 'test-upload-mime-mismatch',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      jest.useRealTimers();

      const { errors } = await uploadApplicationFile({
        applicationUniversalIdentifier: context.applicationUniversalIdentifier,
        fileFolder: context.fileFolder,
        filePath: context.filePath,
        fileBuffer: context.fileBuffer,
        filename: context.filename,
        contentType: context.contentType,
        expectToFail: true,
      });

      jest.useFakeTimers();

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );

  it('should succeed but persist server-derived mime when uploader-controlled mime is misleading', async () => {
    jest.useRealTimers();

    const filePath = 'assets/legit-image.png';

    const { data, errors } = await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'PublicAsset',
      filePath,
      fileBuffer: PNG_BUFFER,
      filename: 'legit-image.png',
      // Misleading multipart mime — server should ignore it and persist image/png.
      contentType: 'text/html',
      expectToFail: false,
    });

    jest.useFakeTimers();

    expect(errors).toBeUndefined();
    expect(data.uploadApplicationFile).toEqual({
      id: expect.any(String),
      path: `public-asset/${filePath}`,
    });

    const [row] = await globalThis.testDataSource.query(
      `SELECT "mimeType" FROM core."file" WHERE id = $1`,
      [data.uploadApplicationFile.id],
    );

    expect(row.mimeType).toBe('image/png');
  }, 60000);
});
