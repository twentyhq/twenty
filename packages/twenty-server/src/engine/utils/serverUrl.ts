import { INestApplication } from '@nestjs/common';

// serverConfig.ts
const ServerUrl = (() => {
  let serverUrl = 'http://localhost:3000';

  return {
    get: () => serverUrl,
    set: (url: string) => {
      serverUrl = url;
    },
  };
})();

export default ServerUrl;
