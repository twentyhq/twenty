import {
  appendFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFile,
  renameSync,
  rmSync,
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

// Nx fails the command on a 5xx or connection error, so failures answer 404 (miss) or 403 (read-only).
export function createNxCacheServer({
  directory,
}: {
  directory: string;
}): Server {
  mkdirSync(directory, { recursive: true });

  const recordUsage = ({
    usage,
    hash,
  }: {
    usage: NxCacheUsage;
    hash: string;
  }) => {
    try {
      appendFileSync(
        join(directory, NX_CACHE_USAGE_LOG_FILE_NAME),
        `${usage} ${hash}\n`,
      );
    } catch (error) {
      console.error(`Could not record Nx cache ${usage} for ${hash}`, error);
    }
  };

  const end = ({
    response,
    status,
  }: {
    response: ServerResponse;
    status: number;
  }) => {
    if (!response.headersSent) {
      response.writeHead(status);
    }
    response.end();
  };

  // Read fully before answering so a read failure is a clean 404, never a truncated 200.
  const handleGet = ({
    hash,
    response,
  }: {
    hash: string;
    response: ServerResponse;
  }) => {
    readFile(join(directory, hash), (error, content) => {
      if (error !== null) {
        recordUsage({ usage: 'miss', hash });
        end({ response, status: 404 });

        return;
      }

      recordUsage({ usage: 'hit', hash });
      response.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': content.length,
      });
      response.end(content);
    });
  };

  const handlePut = ({
    hash,
    request,
    response,
  }: {
    hash: string;
    request: IncomingMessage;
    response: ServerResponse;
  }) => {
    const file = join(directory, hash);

    if (existsSync(file)) {
      request.resume();
      end({ response, status: 409 });

      return;
    }

    const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`;
    const output = createWriteStream(temporaryFile);

    const reject = () => {
      request.resume();
      rmSync(temporaryFile, { force: true });
      end({ response, status: 403 });
    };

    output.on('error', reject);
    request.on('error', reject);
    output.on('finish', () => {
      try {
        renameSync(temporaryFile, file);
        recordUsage({ usage: 'write', hash });
        end({ response, status: 200 });
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
        handleGet({ hash: match[1], response });

        return;
      }

      if (match !== null && request.method === 'PUT') {
        handlePut({ hash: match[1], request, response });

        return;
      }

      request.resume();
      end({ response, status: 404 });
    } catch {
      end({ response, status: request.method === 'PUT' ? 403 : 404 });
    }
  });
}
