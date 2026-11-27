import { createNxCacheServer } from './utils/create-nx-cache-server.util';

const directory = process.env.NX_CACHE_SERVER_DIRECTORY;

if (directory === undefined || directory === '') {
  throw new Error('NX_CACHE_SERVER_DIRECTORY is required');
}

const server = createNxCacheServer({ directory });

process.on('uncaughtException', (error) => {
  console.error('Nx cache server error', error);
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();

  if (address !== null && typeof address === 'object') {
    console.log(`http://127.0.0.1:${address.port}`);
  }
});
