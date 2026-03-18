import * as fs from 'fs';
import * as path from 'path';

import { config } from 'dotenv';
config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

export function generateFrontConfig(): void {
  const configObject = {
    window: {
      _env_: {
        REACT_APP_SERVER_BASE_URL: process.env.SERVER_URL,
      },
    },
  };

  const configString = `<!-- BEGIN: Twenty Config -->
    <script id="twenty-env-config">
      window._env_ = ${JSON.stringify(configObject.window._env_, null, 2)};
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

    // If APP_LABEL is set (e.g. "UAT"), update the page title and swap the
    // favicon for an emoji so the tab is immediately distinguishable from prod.
    const appLabel = process.env.APP_LABEL;

    if (appLabel) {
      indexContent = indexContent.replace(
        '<title>Twenty</title>',
        `<title>Twenty [${appLabel}]</title>`,
      );

      // Emoji favicon via inline SVG data URI — no extra image file required.
      const emojiFavicon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🟡</text></svg>`;

      indexContent = indexContent.replace(
        /<link\s+rel="icon"[^>]*>/,
        `<link rel="icon" type="image/svg+xml" href="${emojiFavicon}" data-rh="true" />`,
      );
    }

    fs.writeFileSync(indexPath, indexContent, 'utf8');
  } catch {
    // oxlint-disable-next-line no-console
    console.log(
      'Frontend build not found or not writable, assuming it is served independently',
    );
  }
}
