import { readFileSync } from 'fs';
import { join } from 'path';

import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const STORAGE_LOCAL_PATH = join(process.cwd(), '.local-storage');

const MALICIOUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" onload="alert(1)">
  <script>alert('xss')</script>
  <a xlink:href="javascript:alert('xss-link')">
    <circle cx="50" cy="50" r="40" />
  </a>
</svg>`;

// Deterministic DOMPurify output for MALICIOUS_SVG. Shape:
//   - <script>...</script> stripped (the two leading spaces on that line are
//     preserved — DOMPurify removes the element, not surrounding whitespace).
//   - onload="..." attribute stripped from <svg>.
//   - xlink:href="javascript:..." stripped from <a> (anchor element kept).
//   - <circle .../> self-closing form normalized to <circle ...></circle>.
// Encoded as a single-line literal so whitespace is unambiguous.
const EXPECTED_SANITIZED_MALICIOUS_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">\n  \n  <a>\n    <circle cx="50" cy="50" r="40"></circle>\n  </a>\n</svg>';

const BENIGN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="red" /></svg>';

const EXPECTED_SANITIZED_BENIGN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="red"></rect></svg>';

describe('Upload application file — SVG sanitization (end-to-end)', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test SVG Sanitization App',
      description: 'App for verifying SVG sanitization end-to-end',
      sourcePath: 'test-svg-sanitization',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('strips scripts, event handlers, and javascript: URIs from an uploaded SVG, persisting the exact sanitized content with image/svg+xml mime', async () => {
    jest.useRealTimers();

    const filePath = 'assets/malicious.svg';

    const { data, errors } = await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'PublicAsset',
      filePath,
      fileBuffer: Buffer.from(MALICIOUS_SVG, 'utf-8'),
      filename: 'malicious.svg',
      contentType: 'image/svg+xml',
      expectToFail: false,
    });

    jest.useFakeTimers();

    expect(errors).toBeUndefined();
    expect(data.uploadApplicationFile).toEqual({
      id: expect.any(String),
      path: `public-asset/${filePath}`,
    });

    const [row] = await globalThis.testDataSource.query(
      `SELECT "mimeType" FROM core."file" WHERE id = $1`,
      [data.uploadApplicationFile.id],
    );

    expect(row.mimeType).toBe('image/svg+xml');

    const onDiskPath = join(
      STORAGE_LOCAL_PATH,
      TEST_WORKSPACE_ID,
      TEST_APP_ID,
      'public-asset',
      filePath,
    );

    const storedContent = readFileSync(onDiskPath, 'utf-8');

    expect(storedContent).toBe(EXPECTED_SANITIZED_MALICIOUS_SVG);
  }, 60000);

  it('preserves a benign SVG with only DOMPurify structural normalization', async () => {
    jest.useRealTimers();

    const filePath = 'assets/benign.svg';

    const { errors } = await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'PublicAsset',
      filePath,
      fileBuffer: Buffer.from(BENIGN_SVG, 'utf-8'),
      filename: 'benign.svg',
      contentType: 'image/svg+xml',
      expectToFail: false,
    });

    jest.useFakeTimers();

    expect(errors).toBeUndefined();

    const onDiskPath = join(
      STORAGE_LOCAL_PATH,
      TEST_WORKSPACE_ID,
      TEST_APP_ID,
      'public-asset',
      filePath,
    );

    const storedContent = readFileSync(onDiskPath, 'utf-8');

    expect(storedContent).toBe(EXPECTED_SANITIZED_BENIGN_SVG);
  }, 60000);
});
