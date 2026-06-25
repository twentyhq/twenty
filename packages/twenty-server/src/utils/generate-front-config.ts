import * as fs from 'fs';
import * as path from 'path';

import { config } from 'dotenv';
config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

export function generateFrontConfig(): void {
  // When FRONT_AUTO_BASE_URL=true (or SERVER_URL is unset), inject an empty
  // _env_ so the frontend's getDefaultUrl() fallback resolves the API origin
  // from the page's own hostname at request time. This lets the same deploy
  // be reached at both http://<external-ip> and http://localhost without a
  // hairpin through the public interface.
  const useAutoUrl =
    process.env.FRONT_AUTO_BASE_URL === 'true' || !process.env.SERVER_URL;

  const envForFront = useAutoUrl
    ? {}
    : { REACT_APP_SERVER_BASE_URL: process.env.SERVER_URL };

  const configString = `<!-- BEGIN: Twenty Config -->
    <script id="twenty-env-config">
      window._env_ = ${JSON.stringify(envForFront, null, 2)};
    </script>
    <!-- END: Twenty Config -->`;

  const distPath = path.join(__dirname, '..', 'front');
  const indexPath = path.join(distPath, 'index.html');

  try {
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    indexContent = indexContent.replace(
      /<!-- BEGIN: Twenty Config -->[\s\S]*?<!-- END: Twenty Config -->/,
      configString,
    );

    fs.writeFileSync(indexPath, indexContent, 'utf8');
  } catch {
    // oxlint-disable-next-line no-console
    console.log(
      'Frontend build not found or not writable, assuming it is served independently',
    );
  }
}
