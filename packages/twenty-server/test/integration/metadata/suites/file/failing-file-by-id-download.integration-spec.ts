import request from 'supertest';
import {
  extractPathAndQueryFromUrl,
  swapFileIdInUrl,
} from 'test/integration/metadata/suites/file/utils/file-by-id-url-helpers.util';
import { seedWorkspaceLogo } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { FileFolder } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

describe('File-by-id controller download should fail', () => {
  let fileId: string;
  let validUrlPath: string;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    jest.useRealTimers();

    const seeded = await seedWorkspaceLogo();

    fileId = seeded.fileId;
    validUrlPath = extractPathAndQueryFromUrl(seeded.signedUrl);
    cleanup = seeded.cleanup;

    jest.useFakeTimers();
  }, 60000);

  afterAll(async () => {
    await cleanup();
  });

  it('should respond 403 when the request has no token query parameter', async () => {
    jest.useRealTimers();

    const response = await request(global.app.getHttpServer()).get(
      `/file/${FileFolder.CorePicture}/${fileId}`,
    );

    jest.useFakeTimers();

    expect(response.text ?? '').not.toMatch(/postgres:|secret/i);

    expectOneNotInternalServerErrorHttpResponseSnapshot({
      status: response.status,
      body: response.body,
    });
  }, 30000);

  it('should respond 403 when the URL fileId does not match the token payload', async () => {
    jest.useRealTimers();

    const tamperedUrlPath = swapFileIdInUrl(validUrlPath, uuidv4());

    const response = await request(global.app.getHttpServer()).get(
      tamperedUrlPath,
    );

    jest.useFakeTimers();

    expect(response.text ?? '').not.toMatch(/postgres:|secret/i);

    expectOneNotInternalServerErrorHttpResponseSnapshot({
      status: response.status,
      body: response.body,
    });
  }, 30000);

  it('should respond 404 when the file row no longer exists', async () => {
    jest.useRealTimers();

    await globalThis.testDataSource.query(
      `UPDATE core."file" SET "deletedAt" = now() WHERE id = $1`,
      [fileId],
    );

    try {
      const response = await request(global.app.getHttpServer()).get(
        validUrlPath,
      );

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('FILE_NOT_FOUND');
      expect(response.text ?? '').not.toMatch(/postgres:|secret/i);
    } finally {
      await globalThis.testDataSource.query(
        `UPDATE core."file" SET "deletedAt" = NULL WHERE id = $1`,
        [fileId],
      );

      jest.useFakeTimers();
    }
  }, 30000);

  it('should respond 404 when the storage object is missing while the DB row still exists', async () => {
    jest.useRealTimers();

    const [{ path: originalPath }] = (await globalThis.testDataSource.query(
      `SELECT path FROM core."file" WHERE id = $1`,
      [fileId],
    )) as [{ path: string }];

    await globalThis.testDataSource.query(
      `UPDATE core."file" SET path = $1 WHERE id = $2`,
      [`CorePicture/${uuidv4()}.png`, fileId],
    );

    try {
      const response = await request(global.app.getHttpServer()).get(
        validUrlPath,
      );

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('FILE_NOT_FOUND');
      expect(response.text ?? '').not.toMatch(/postgres:|secret/i);
    } finally {
      await globalThis.testDataSource.query(
        `UPDATE core."file" SET path = $1 WHERE id = $2`,
        [originalPath, fileId],
      );

      jest.useFakeTimers();
    }
  }, 30000);
});
