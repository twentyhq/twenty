import * as fs from 'fs';
import * as path from 'path';

import { config } from 'dotenv';
config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export function generateFrontConfig(): void {
  const configObject = {
    window: {
      _env_: {
        REACT_APP_SERVER_BASE_URL: process.env.SERVER_URL,
      },
    },
  };

  const configString = `window._env_ = ${JSON.stringify(
    configObject.window._env_,
    null,
    2,
  )};`;

  const distPath = path.join(__dirname, '../..', 'front');
  const filePath = path.join(distPath, 'env-config.js');

  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  if (
    !fs.existsSync(filePath) ||
    fs.readFileSync(filePath, 'utf8') !== configString
  ) {
    fs.writeFileSync(filePath, configString, 'utf8');
  }
}
