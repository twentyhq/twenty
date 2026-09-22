import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { completeApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads.util';
import { createApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
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
  fileFolder: string;
  filePath: string;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title:
      'when a PublicAsset .png path receives a plain text body (magic-byte mismatch)',
    context: {
      fileFolder: 'PublicAsset',
      filePath: 'assets/fake-image.png',
    },
  },
  {
    title:
      'when a PublicAsset .pdf path receives a plain text body (magic-byte mismatch)',
    context: {
      fileFolder: 'PublicAsset',
      filePath: 'docs/fake.pdf',
    },
  },
  {
    title:
      'when a PublicAsset .zip path receives a plain text body (magic-byte mismatch)',
    context: {
      fileFolder: 'PublicAsset',
      filePath: 'archives/fake.zip',
    },
  },
];

describe('Application file upload should fail at completion on mime/magic-byte mismatch', () => {
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

      const { data: createData, errors: createErrors } =
        await createApplicationFileUploads({
          applicationUniversalIdentifier: TEST_APP_ID,
          files: [
            {
              fileFolder: context.fileFolder,
              filePath: context.filePath,
              size: TEXT_BUFFER.length,
            },
          ],
        });

      expect(createErrors).toBeUndefined();

      const [uploadTarget] = createData.createApplicationFileUploads.targets;

      const putResponse = await putApplicationFileUploadTarget({
        uploadTarget,
        body: TEXT_BUFFER,
      });

      expect(putResponse.status).toBe(204);

      const { data: completeData, errors: completeErrors } =
        await completeApplicationFileUploads({
          applicationUniversalIdentifier: TEST_APP_ID,
          fileIds: [uploadTarget.fileId],
        });

      jest.useFakeTimers();

      expect(completeErrors).toBeUndefined();

      const { files, errors } = completeData.completeApplicationFileUploads;

      expect(files).toEqual([]);
      expect(errors).toHaveLength(1);
      expect(errors[0].fileId).toBe(uploadTarget.fileId);
      expect(errors[0].message).toMatchSnapshot();

      const [row] = await globalThis.testDataSource.query(
        `SELECT status FROM core."file" WHERE id = $1`,
        [uploadTarget.fileId],
      );

      expect(row.status).toBe('PENDING');
    },
    60000,
  );

  it('should persist the mime type detected from the bytes', async () => {
    jest.useRealTimers();

    const filePath = 'assets/legit-image.png';

    const { data, errors } = await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'PublicAsset',
      filePath,
      fileBuffer: PNG_BUFFER,
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
