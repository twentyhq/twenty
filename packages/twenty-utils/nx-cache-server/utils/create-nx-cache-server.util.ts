import {
  appendFileSync,
  createWriteStream,
  mkdirSync,
  readFile,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import { join } from 'node:path';

export const NX_CACHE_USAGE_LOG_FILE_NAME = '.usage';

const CACHE_PATH_PATTERN = /^\/v1\/cache\/([A-Za-z0-9_-]+)$/;

type NxCacheUsage = 'hit' | 'miss' | 'write';

// Serves Nx's self-hosted remote cache API from a directory. Nx fails the whole
// command on any 5xx or connection error, so every failure maps to a status it
// accepts: 404 (miss) on reads and 403 (read-only) on writes.
export function createNxCacheServer({
  directory,
}: {
  directory: string;
}): Server {
  mkdirSync(directory, { recursive: true });

  const recordUsage = (usage: NxCacheUsage, hash: string) => {
    try {
      appendFileSync(
        join(directory, NX_CACHE_USAGE_LOG_FILE_NAME),
        `${usage} ${hash}\n`,
      );
    } catch {}
  };

  const end = (response: ServerResponse, status: number) => {
    if (!response.headersSent) {
      response.writeHead(status);
    }
    response.end();
  };

  // Read fully before answering so a read failure is a clean 404, never a truncated 200.
  const handleGet = (hash: string, response: ServerResponse) => {
    readFile(join(directory, hash), (error, content) => {
      if (error !== null) {
        recordUsage('miss', hash);
        end(response, 404);

        return;
      }

      recordUsage('hit', hash);
      response.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': content.length,
      });
      response.end(content);
    });
  };

  const handlePut = (
    hash: string,
    request: IncomingMessage,
    response: ServerResponse,
  ) => {
    const file = join(directory, hash);

    try {
      statSync(file);
      request.resume();
      end(response, 409);

      return;
    } catch {}

    const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`;
    const output = createWriteStream(temporaryFile);

    const reject = () => {
      request.resume();
      rmSync(temporaryFile, { force: true });
      end(response, 403);
    };

    output.on('error', reject);
    request.on('error', reject);
    output.on('finish', () => {
      try {
        renameSync(temporaryFile, file);
        recordUsage('write', hash);
        end(response, 200);
      } catch {
        reject();
      }
    });
    request.pipe(output);
  };

  return createServer((request, response) => {
    try {
      const match = CACHE_PATH_PATTERN.exec(request.url ?? '');

      if (match !== null && request.method === 'GET') {
        handleGet(match[1], response);

        return;
      }

      if (match !== null && request.method === 'PUT') {
        handlePut(match[1], request, response);

        return;
      }

      request.resume();
      end(response, 404);
    } catch {
      end(response, request.method === 'PUT' ? 403 : 404);
    }
  });
}
