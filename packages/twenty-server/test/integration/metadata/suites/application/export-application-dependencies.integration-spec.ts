import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FileFolder } from 'twenty-shared/types';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'b1cf31ad-d8b5-4728-960b-34e02ad07a51';
const PACKAGE_JSON =
  '{\n  "name": "export-dependencies", "version": "1.0.0"\n}\n';
const YARN_LOCK = '# Stored dependency lockfile\n';
const APPLICATION_IDENTIFIER = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  applicationUniversalIdentifier: TEST_APP_ID,
};

const PACKAGE_JSON_EXPORT = {
  folder: FileFolder.Dependencies,
  path: 'package.json',
  content: PACKAGE_JSON,
};
const YARN_LOCK_EXPORT = {
  folder: FileFolder.Dependencies,
  path: 'yarn.lock',
  content: YARN_LOCK,
};

describe('Application export - dependency files', () => {
  let fileStorageService: FileStorageService;

  const writeFile = ({
    fileFolder = FileFolder.Dependencies,
    resourcePath,
    content,
  }: {
    fileFolder?: FileFolder;
    resourcePath: string;
    content: string;
  }) =>
    fileStorageService.writeFile({
      ...APPLICATION_IDENTIFIER,
      fileFolder,
      resourcePath,
      sourceFile: Buffer.from(content),
      settings: { isTemporaryFile: false, toDelete: false },
    });

  beforeAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Export Dependencies Test Application',
      description: 'App for testing dependency file export',
      sourcePath: 'export-dependencies',
    });
    jest.useRealTimers();
    fileStorageService =
      getAppProviderByClassName<FileStorageService>('FileStorageService');
  });

  beforeEach(async () => {
    await writeFile({ resourcePath: 'package.json', content: PACKAGE_JSON });
    await writeFile({ resourcePath: 'yarn.lock', content: YARN_LOCK });
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each([undefined, false])(
    'keeps exports metadata-only when shouldIncludeDependencies is %s',
    async (shouldIncludeDependencies) => {
      const { data, errors } = await exportApplication({
        universalIdentifier: TEST_APP_ID,
        shouldIncludeDependencies,
      });

      expect(errors).toBeUndefined();
      expect(data.exportApplication.files).toEqual([]);
    },
  );

  it('exports only the dependency pair, preserving stored content exactly', async () => {
    for (const fileFolder of [
      FileFolder.Source,
      FileFolder.PublicAsset,
      FileFolder.FilesField,
      FileFolder.EmailAttachment,
    ]) {
      await writeFile({
        fileFolder,
        resourcePath: 'package.json',
        content: '{"private":"excluded"}',
      });
    }
    await writeFile({ resourcePath: 'other.json', content: '{}' });
    await writeFile({ resourcePath: 'nested/package.json', content: '{}' });

    const { data, errors } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      shouldIncludeDependencies: true,
    });

    expect(errors).toBeUndefined();
    expect(data.exportApplication.files).toEqual([
      PACKAGE_JSON_EXPORT,
      YARN_LOCK_EXPORT,
    ]);
  });

  it('exports package.json when no lockfile is stored', async () => {
    await fileStorageService.deleteFile({
      ...APPLICATION_IDENTIFIER,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'yarn.lock',
    });

    const { data, errors } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      shouldIncludeDependencies: true,
    });

    expect(errors).toBeUndefined();
    expect(data.exportApplication.files).toEqual([PACKAGE_JSON_EXPORT]);
  });

  it('keeps metadata available when package.json is absent', async () => {
    await fileStorageService.deleteFile({
      ...APPLICATION_IDENTIFIER,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'package.json',
    });

    const { data, errors } = await exportApplication({
      universalIdentifier: TEST_APP_ID,
      shouldIncludeDependencies: true,
    });

    expect(errors).toBeUndefined();
    expect(data.exportApplication.files).toEqual([]);
    expect(
      data.exportApplication.manifest.application.universalIdentifier,
    ).toBe(TEST_APP_ID);
  });
});
