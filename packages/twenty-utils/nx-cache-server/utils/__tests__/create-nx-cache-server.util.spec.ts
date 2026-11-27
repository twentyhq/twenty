import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createNxCacheServer,
  NX_CACHE_USAGE_LOG_FILE_NAME,
} from '../create-nx-cache-server.util';

describe('createNxCacheServer', () => {
  let directory: string;
  let server: Server;
  let baseUrl: string;

  const readUsage = () =>
    readFileSync(join(directory, NX_CACHE_USAGE_LOG_FILE_NAME), 'utf8')
      .trim()
      .split('\n');

  const put = ({ hash, body }: { hash: string; body: string }) =>
    fetch(`${baseUrl}/v1/cache/${hash}`, { method: 'PUT', body });

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), 'nx-cache-server-'));
    server = createNxCacheServer({ directory });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Nx cache server is not listening on a port');
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
    rmSync(directory, { recursive: true, force: true });
  });

  it('answers 404 for an output it does not have', async () => {
    const response = await fetch(`${baseUrl}/v1/cache/123`);

    expect(response.status).toBe(404);
    expect(readUsage()).toEqual(['miss 123']);
  });

  it('serves an uploaded output back', async () => {
    const upload = await put({ hash: '123', body: 'task output' });
    const response = await fetch(`${baseUrl}/v1/cache/123`);

    expect(upload.status).toBe(200);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('task output');
    expect(readUsage()).toEqual(['write 123', 'hit 123']);
  });

  it('refuses to overwrite an existing output', async () => {
    await put({ hash: '123', body: 'original' });
    const response = await put({ hash: '123', body: 'replacement' });

    expect(response.status).toBe(409);
    expect(readFileSync(join(directory, '123'), 'utf8')).toBe('original');
  });

  it('answers 403 instead of an error when an upload cannot be written', async () => {
    rmSync(directory, { recursive: true, force: true });

    const response = await put({ hash: '123', body: 'task output' });

    expect(response.status).toBe(403);
  });

  it('answers 404 instead of an error when an output cannot be read', async () => {
    mkdirSync(join(directory, '123'));

    const response = await fetch(`${baseUrl}/v1/cache/123`);

    expect(response.status).toBe(404);
  });

  it('answers 404 for paths outside the cache API', async () => {
    const response = await fetch(`${baseUrl}/v1/cache/../secret`);

    expect(response.status).toBe(404);
  });
});
