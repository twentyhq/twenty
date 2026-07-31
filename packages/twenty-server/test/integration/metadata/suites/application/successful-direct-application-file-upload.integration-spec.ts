import { readFileSync } from 'fs';
import { join } from 'path';

import request from 'supertest';
import {
  type ApplicationFileUploadTarget,
  completeApplicationFileUploads,
  createApplicationFileUploads,
} from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_UID = uuidv4();
const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const STORAGE_LOCAL_PATH = join(process.cwd(), '.local-storage');

const HANDLER_PATH = 'handler.mjs';
const HANDLER_CONTENT = 'export const main = () => "hello";';

const LOGO_PATH = 'assets/logo.svg';
const LOGO_CONTENT =
  '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle r="10" /></svg>';
const EXPECTED_SANITIZED_LOGO_CONTENT =
  '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"></circle></svg>';

const putToUploadTarget = (
  uploadTarget: ApplicationFileUploadTarget,
  body: Buffer,
) => {
  const { pathname, search } = new URL(uploadTarget.uploadUrl);

  return request(`http://localhost:${APP_PORT}`)
    .put(`${pathname}${search}`)
    .set('Content-Type', uploadTarget.contentType)
    .send(body);
};

const readStoredFile = (fileFolder: string, filePath: string) =>
  readFileSync(
    join(
      STORAGE_LOCAL_PATH,
      TEST_WORKSPACE_ID,
      TEST_APP_UID,
      fileFolder,
      filePath,
    ),
    'utf-8',
  );

describe('Direct application file upload', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_UID,
      name: 'Test Direct Application File Upload App',
      description: 'App for verifying batched direct application file uploads',
      sourcePath: 'test-direct-application-file-upload',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_UID,
    });
  });

  it('should upload a whole batch of files without going through the server body', async () => {
    jest.useRealTimers();

    const handlerBuffer = Buffer.from(HANDLER_CONTENT, 'utf-8');
    const logoBuffer = Buffer.from(LOGO_CONTENT, 'utf-8');

    const { data: createData, errors: createErrors } =
      await createApplicationFileUploads({
        applicationUniversalIdentifier: TEST_APP_UID,
        files: [
          {
            fileFolder: 'BuiltLogicFunction',
            filePath: HANDLER_PATH,
            size: handlerBuffer.length,
          },
          {
            fileFolder: 'PublicAsset',
            filePath: LOGO_PATH,
            size: logoBuffer.length,
          },
        ],
      });

    expect(createErrors).toBeUndefined();

    const { targets, errors: reservationErrors } =
      createData!.createApplicationFileUploads;

    expect(reservationErrors).toEqual([]);
    expect(targets).toHaveLength(2);
    expect(targets[0].filePath).toBe(HANDLER_PATH);
    expect(targets[0].fileFolder).toBe('BuiltLogicFunction');
    expect(targets[1].filePath).toBe(LOGO_PATH);

    const [pendingRow] = await globalThis.testDataSource.query(
      `SELECT status, "mimeType" FROM core."file" WHERE id = $1`,
      [targets[0].fileId],
    );

    expect(pendingRow.status).toBe('PENDING');
    expect(pendingRow.mimeType).toBe('application/octet-stream');

    const handlerResponse = await putToUploadTarget(targets[0], handlerBuffer);
    const logoResponse = await putToUploadTarget(targets[1], logoBuffer);

    expect(handlerResponse.status).toBe(204);
    expect(logoResponse.status).toBe(204);

    const { data: completeData, errors: completeRequestErrors } =
      await completeApplicationFileUploads({
        applicationUniversalIdentifier: TEST_APP_UID,
        fileIds: targets.map((target) => target.fileId),
      });

    jest.useFakeTimers();

    expect(completeRequestErrors).toBeUndefined();

    const { files: completedFiles, errors: completionErrors } =
      completeData!.completeApplicationFileUploads;

    expect(completionErrors).toEqual([]);
    expect(completedFiles).toHaveLength(2);

    const rows = await globalThis.testDataSource.query(
      `SELECT id, status, "mimeType" FROM core."file" WHERE id = ANY($1)`,
      [targets.map((target) => target.fileId)],
    );

    expect(rows).toHaveLength(2);
    expect(
      rows.every((row: { status: string }) => row.status === 'UPLOADED'),
    ).toBe(true);

    expect(readStoredFile('built-logic-function', HANDLER_PATH)).toBe(
      HANDLER_CONTENT,
    );

    expect(readStoredFile('public-asset', LOGO_PATH)).toBe(
      EXPECTED_SANITIZED_LOGO_CONTENT,
    );

    const logoRow = rows.find(
      (row: { id: string }) => row.id === targets[1].fileId,
    );

    expect(logoRow.mimeType).toBe('image/svg+xml');
  }, 60000);

  it('should fail slow: reserve valid files and report a disallowed folder as a per-file error', async () => {
    jest.useRealTimers();

    const { data } = await createApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      files: [
        { fileFolder: 'Source', filePath: 'src/valid.ts', size: 10 },
        { fileFolder: 'FilesField', filePath: 'note.pdf', size: 10 },
      ],
    });

    jest.useFakeTimers();

    const { targets, errors } = data!.createApplicationFileUploads;

    expect(targets).toHaveLength(1);
    expect(targets[0].filePath).toBe('src/valid.ts');
    expect(errors).toHaveLength(1);
    expect(errors[0].filePath).toBe('note.pdf');
    expect(errors[0].message).toContain('Invalid fileFolder');
  }, 30000);

  it('should fail slow: report a path escaping the application folder as a per-file error', async () => {
    jest.useRealTimers();

    const { data } = await createApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      files: [
        {
          fileFolder: 'Source',
          filePath: '../../../etc/passwd.ts',
          size: 10,
        },
      ],
    });

    jest.useFakeTimers();

    const { targets, errors } = data!.createApplicationFileUploads;

    expect(targets).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].filePath).toBe('../../../etc/passwd.ts');
  }, 30000);

  it('should fail slow: report a file whose bytes never reached storage as a per-file completion error', async () => {
    jest.useRealTimers();

    const { data: createData } = await createApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      files: [
        { fileFolder: 'Source', filePath: 'never-uploaded.ts', size: 10 },
      ],
    });

    const fileId =
      createData!.createApplicationFileUploads.targets[0].fileId;

    const { data: completeData } = await completeApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      fileIds: [fileId],
    });

    jest.useFakeTimers();

    const { files, errors } = completeData!.completeApplicationFileUploads;

    expect(files).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].fileId).toBe(fileId);
    expect(errors[0].message).toContain('has not been uploaded to storage');
  }, 30000);
});
