import request from 'supertest';
import { extractPathAndQueryFromUrl } from 'test/integration/metadata/suites/file/utils/file-by-id-url-helpers.util';
import {
  cleanupTestWorkspaceLogo,
  uploadTestWorkspaceLogo,
} from 'test/integration/metadata/suites/file/utils/workspace-logo-test-fixture.util';

describe('File-by-id controller download should succeed', () => {
  let fileId: string;
  let signedUrl: string;
  let workspaceId: string;

  beforeAll(async () => {
    jest.useRealTimers();

    const uploaded = await uploadTestWorkspaceLogo();

    fileId = uploaded.fileId;
    signedUrl = uploaded.signedUrl;
    workspaceId = uploaded.workspaceId;

    jest.useFakeTimers();
  }, 60000);

  afterAll(async () => {
    await cleanupTestWorkspaceLogo({ fileId, workspaceId });
  });

  it('should stream the workspace logo with correct headers and a non-empty image body', async () => {
    jest.useRealTimers();

    const response = await request(global.app.getHttpServer())
      .get(extractPathAndQueryFromUrl(signedUrl))
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    jest.useFakeTimers();

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('image/png');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-disposition']).toBe('inline');

    const body = response.body as Buffer;

    expect(body.length).toBeGreaterThan(8);
    expect(body[0]).toBe(0x89);
    expect(body[1]).toBe(0x50);
    expect(body[2]).toBe(0x4e);
    expect(body[3]).toBe(0x47);
  }, 30000);
});
