import { readFileSync, statSync } from 'fs';
import { join } from 'path';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const STORAGE_LOCAL_PATH = join(process.cwd(), '.local-storage');
const FILE_FOLDER = FileFolder.Workflow;

describe('Writing a file whose stored content is unchanged', () => {
  let fileStorageService: FileStorageService;
  let applicationUniversalIdentifier: string;
  const writtenResourcePaths = new Set<string>();

  const writeFile = ({
    resourcePath,
    content,
  }: {
    resourcePath: string;
    content: string;
  }) => {
    writtenResourcePaths.add(resourcePath);

    return fileStorageService.writeFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FILE_FOLDER,
      resourcePath,
      sourceFile: content,
      settings: { isTemporaryFile: false, toDelete: false },
    });
  };

  const getStoredFilePath = (resourcePath: string) =>
    join(
      STORAGE_LOCAL_PATH,
      SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      FILE_FOLDER,
      resourcePath,
    );

  beforeAll(async () => {
    jest.useRealTimers();

    fileStorageService =
      getAppProviderByClassName<FileStorageService>('FileStorageService');

    const [workspaceCustomApplication]: { universalIdentifier: string }[] =
      await global.testDataSource.query(
        `SELECT application."universalIdentifier"
         FROM core."workspace" workspace
         JOIN core."application" application
           ON application.id = workspace."workspaceCustomApplicationId"
         WHERE workspace.id = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    applicationUniversalIdentifier =
      workspaceCustomApplication.universalIdentifier;
  });

  afterEach(async () => {
    for (const resourcePath of writtenResourcePaths) {
      await fileStorageService.deleteFile({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationUniversalIdentifier,
        fileFolder: FILE_FOLDER,
        resourcePath,
      });
    }

    writtenResourcePaths.clear();
  });

  it('leaves the stored object untouched when the content is identical', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    const firstFile = await writeFile({ resourcePath, content: 'same' });
    const firstModifiedAt = statSync(getStoredFilePath(resourcePath)).mtimeMs;

    await new Promise((resolve) => setTimeout(resolve, 20));

    const secondFile = await writeFile({ resourcePath, content: 'same' });

    expect(statSync(getStoredFilePath(resourcePath)).mtimeMs).toBe(
      firstModifiedAt,
    );
    expect(secondFile.id).toBe(firstFile.id);
  });

  it('overwrites the stored object when same-size content differs', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    await writeFile({ resourcePath, content: 'aaaa' });
    await writeFile({ resourcePath, content: 'bbbb' });

    expect(readFileSync(getStoredFilePath(resourcePath), 'utf-8')).toBe('bbbb');
  });

  it('writes the object again after the file was deleted', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    await writeFile({ resourcePath, content: 'same' });
    await fileStorageService.deleteFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FILE_FOLDER,
      resourcePath,
    });
    await writeFile({ resourcePath, content: 'same' });

    expect(readFileSync(getStoredFilePath(resourcePath), 'utf-8')).toBe('same');
  });
});
