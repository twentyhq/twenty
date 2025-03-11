import * as fs from 'fs';
import * as path from 'path';

import { config } from 'dotenv';
config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export function generateFrontConfig(): void {
  const configObject = {
    window: {
      _env_: {
        REACT_APP_SERVER_BASE_URL: process.env.SERVER_URL,
        REACT_APP_CHATBOT_BASE_URL: process.env.REACT_APP_CHATBOT_BASE_URL,
        REACT_APP_STRIPE_PUBLISHABLE_KEY:
          process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
        REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
        REACT_APP_FIREBASE_AUTH_DOMAIN:
          process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        REACT_APP_FIREBASE_PROJECT_ID:
          process.env.REACT_APP_FIREBASE_PROJECT_ID,
        REACT_APP_FIREBASE_STORAGE_BUCKET:
          process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID:
          process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
      },
    },
  };

  const configString = `<!-- BEGIN: Twenty Config -->
    <script id="twenty-env-config">
      window._env_ = ${JSON.stringify(configObject.window._env_, null, 2)};
    </script>
    <!-- END: Twenty Config -->`;

  const distPath = path.join(__dirname, '../..', 'front');
  const indexPath = path.join(distPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    // eslint-disable-next-line no-console
    console.log(
      'Frontend build not found, assuming it is served independently',
    );

    return;
  }

  let indexContent = fs.readFileSync(indexPath, 'utf8');

  indexContent = indexContent.replace(
    /<!-- BEGIN: Twenty Config -->[\s\S]*?<!-- END: Twenty Config -->/,
    configString,
  );

  fs.writeFileSync(indexPath, indexContent, 'utf8');
}
