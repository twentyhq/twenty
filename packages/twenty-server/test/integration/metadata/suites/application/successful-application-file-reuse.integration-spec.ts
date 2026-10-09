import { createHash } from 'node:crypto';
import { unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createApplicationFileUploads } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { uploadApplicationFileWithDirectUpload } from 'test/integration/metadata/suites/application/utils/upload-application-file-with-direct-upload.util';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_UID = uuidv4();
const OTHER_APP_UID = uuidv4();
const CONTENT = Buffer.from('export const main = () => "hello";');
const CONTENT_HASH = createHash('sha256').update(CONTENT).digest('hex');

const upload = (filePath: string) =>
  uploadApplicationFileWithDirectUpload({
    applicationUniversalIdentifier: TEST_APP_UID,
    fileFolder: 'BuiltLogicFunction',
    filePath,
    fileBuffer: CONTENT,
  });

const storedPath = (filePath: string) =>
  join(
    process.cwd(),
    '.local-storage',
    SEED_APPLE_WORKSPACE_ID,
    TEST_APP_UID,
    'built-logic-function',
    filePath,
  );

const request = (filePath: string) => ({
  fileFolder: 'BuiltLogicFunction',
  filePath,
  size: CONTENT.length,
  sha256: CONTENT_HASH,
});

describe('Application file content reuse', () => {
  beforeAll(async () => {
    jest.useRealTimers();
    for (const applicationUniversalIdentifier of [
      TEST_APP_UID,
      OTHER_APP_UID,
    ]) {
      await setupApplicationForSync({
        applicationUniversalIdentifier,
        name: 'Test Application File Reuse',
        description: 'App for verifying reuse against uploaded storage',
        sourcePath: 'test-application-file-reuse',
      });
    }
  }, 60000);

  beforeEach(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    for (const applicationUniversalIdentifier of [
      TEST_APP_UID,
      OTHER_APP_UID,
    ]) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
    jest.useFakeTimers();
  });

  it('reuses an uploaded file without reserving it again or changing its status', async () => {
    const filePath = 'unchanged.mjs';
    const uploaded = await upload(filePath);
    const { data, errors } = await createApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      files: [request(filePath)],
    });
    expect(errors).toBeUndefined();
    expect(data!.createApplicationFileUploads).toEqual({
      targets: [],
      unchangedFiles: [{ fileFolder: 'BuiltLogicFunction', filePath }],
      errors: [],
    });
    const rows = await globalThis.testDataSource.query(
      'SELECT status FROM core."file" WHERE id = $1',
      [uploaded.data!.uploadApplicationFile.id],
    );
    expect(rows).toEqual([{ status: 'UPLOADED' }]);
  });

  it('reserves only changed and missing files from a mixed batch', async () => {
    await upload('mixed-unchanged.mjs');
    await upload('mixed-changed.mjs');
    const changedHash = createHash('sha256')
      .update(Buffer.alloc(CONTENT.length))
      .digest('hex');
    const { data } = await createApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      files: [
        request('mixed-unchanged.mjs'),
        { ...request('mixed-changed.mjs'), sha256: changedHash },
        request('mixed-missing.mjs'),
      ],
    });
    expect(data!.createApplicationFileUploads.errors).toEqual([]);
    expect(data!.createApplicationFileUploads.unchangedFiles).toEqual([
      { fileFolder: 'BuiltLogicFunction', filePath: 'mixed-unchanged.mjs' },
    ]);
    expect(
      data!.createApplicationFileUploads.targets.map(
        (target) => target.filePath,
      ),
    ).toEqual(['mixed-changed.mjs', 'mixed-missing.mjs']);
  });

  it.each(['missing', 'replaced'])(
    'uploads again when stored bytes are %s',
    async (change) => {
      const filePath = `storage-${change}.mjs`;
      await upload(filePath);
      if (change === 'missing') {
        unlinkSync(storedPath(filePath));
      } else {
        writeFileSync(storedPath(filePath), Buffer.alloc(CONTENT.length));
      }
      const { data } = await createApplicationFileUploads({
        applicationUniversalIdentifier: TEST_APP_UID,
        files: [request(filePath)],
      });
      expect(data!.createApplicationFileUploads.errors).toEqual([]);
      expect(data!.createApplicationFileUploads.unchangedFiles).toEqual([]);
      expect(data!.createApplicationFileUploads.targets).toHaveLength(1);
    },
  );

  it('keeps legacy uploads unconditional and never reuses a pending file', async () => {
    const filePath = 'pending.mjs';
    await upload(filePath);
    const { data: legacyData } = await createApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      files: [
        { fileFolder: 'BuiltLogicFunction', filePath, size: CONTENT.length },
      ],
    });
    expect(legacyData!.createApplicationFileUploads.targets).toHaveLength(1);
    expect(legacyData!.createApplicationFileUploads.unchangedFiles).toEqual([]);
    const { data } = await createApplicationFileUploads({
      applicationUniversalIdentifier: TEST_APP_UID,
      files: [request(filePath)],
    });
    expect(data!.createApplicationFileUploads.unchangedFiles).toEqual([]);
    expect(data!.createApplicationFileUploads.targets).toHaveLength(1);
  });

  it('does not reuse identical paths and hashes from another application', async () => {
    const filePath = 'other-app.mjs';
    await upload(filePath);
    const { data } = await createApplicationFileUploads({
      applicationUniversalIdentifier: OTHER_APP_UID,
      files: [request(filePath)],
    });
    expect(data!.createApplicationFileUploads.errors).toEqual([]);
    expect(data!.createApplicationFileUploads.unchangedFiles).toEqual([]);
    expect(data!.createApplicationFileUploads.targets).toHaveLength(1);
  });
});
