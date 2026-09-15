import request from 'supertest';
import { extractPathAndQueryFromUrl } from 'test/integration/metadata/suites/file/utils/file-by-id-url-helpers.util';
import {
  ONE_BY_ONE_TRANSPARENT_PNG,
  seedWorkspaceLogo,
} from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';

describe('File-by-id controller download should succeed', () => {
  let signedUrl: string;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    jest.useRealTimers();

    const seeded = await seedWorkspaceLogo();

    signedUrl = seeded.signedUrl;
    cleanup = seeded.cleanup;

    jest.useFakeTimers();
  }, 60000);

  afterAll(async () => {
    await cleanup();
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

    expect(body.equals(ONE_BY_ONE_TRANSPARENT_PNG)).toBe(true);
  }, 30000);

  it('should stream a requested byte range using the persisted file size', async () => {
    jest.useRealTimers();

    const response = await request(global.app.getHttpServer())
      .get(extractPathAndQueryFromUrl(signedUrl))
      .set('Range', 'bytes=0-9')
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    jest.useFakeTimers();

    expect(response.status).toBe(206);
    expect(response.headers['accept-ranges']).toBe('bytes');
    expect(response.headers['content-range']).toBe(
      `bytes 0-9/${ONE_BY_ONE_TRANSPARENT_PNG.length}`,
    );
    expect(response.headers['content-length']).toBe('10');
    expect(response.body).toEqual(ONE_BY_ONE_TRANSPARENT_PNG.subarray(0, 10));
  }, 30000);

  it('should stream from the requested offset to the end for an open-ended range', async () => {
    jest.useRealTimers();

    const response = await request(global.app.getHttpServer())
      .get(extractPathAndQueryFromUrl(signedUrl))
      .set('Range', 'bytes=10-')
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    jest.useFakeTimers();

    expect(response.status).toBe(206);
    expect(response.headers['content-range']).toBe(
      `bytes 10-${ONE_BY_ONE_TRANSPARENT_PNG.length - 1}/${ONE_BY_ONE_TRANSPARENT_PNG.length}`,
    );
    expect(response.body).toEqual(ONE_BY_ONE_TRANSPARENT_PNG.subarray(10));
  }, 30000);

  it('should ignore a malformed range header and stream the full file', async () => {
    jest.useRealTimers();

    const response = await request(global.app.getHttpServer())
      .get(extractPathAndQueryFromUrl(signedUrl))
      .set('Range', 'bytes=abc')
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    jest.useFakeTimers();

    expect(response.status).toBe(200);
    expect((response.body as Buffer).equals(ONE_BY_ONE_TRANSPARENT_PNG)).toBe(
      true,
    );
  }, 30000);

  it('should reject a byte range beyond the persisted file size', async () => {
    jest.useRealTimers();

    const response = await request(global.app.getHttpServer())
      .get(extractPathAndQueryFromUrl(signedUrl))
      .set('Range', `bytes=${ONE_BY_ONE_TRANSPARENT_PNG.length}-`);

    jest.useFakeTimers();

    expect(response.status).toBe(416);
    expect(response.headers['content-range']).toBe(
      `bytes */${ONE_BY_ONE_TRANSPARENT_PNG.length}`,
    );
  }, 30000);
});
