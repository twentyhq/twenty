import { createHash } from 'crypto';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FileFolder } from 'twenty-shared/types';
import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const STORAGE_LOCAL_PATH = join(process.cwd(), '.local-storage');
const FILE_FOLDER = FileFolder.Workflow;
const FILE_SETTINGS = { isTemporaryFile: false, toDelete: false };

const computeSha256 = (content: string | Buffer) =>
  createHash('sha256').update(content).digest('hex');

describe('Writing a file whose stored content is unchanged', () => {
  let fileStorageService: FileStorageService;
  let applicationUniversalIdentifier: string;
  const writtenResourcePaths = new Set<string>();

  const writeFile = ({
    resourcePath,
    content,
    queryRunner,
  }: {
    resourcePath: string;
    content: string;
    queryRunner?: QueryRunner;
  }) => {
    writtenResourcePaths.add(resourcePath);

    return fileStorageService.writeFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FILE_FOLDER,
      resourcePath,
      sourceFile: content,
      settings: FILE_SETTINGS,
      queryRunner,
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

  const findRowContentSha256 = async (
    resourcePath: string,
  ): Promise<string | null> => {
    const [file]: { contentSha256: string | null }[] =
      await global.testDataSource.query(
        `SELECT "contentSha256" FROM core."file" WHERE "workspaceId" = $1 AND path = $2`,
        [SEED_APPLE_WORKSPACE_ID, `${FILE_FOLDER}/${resourcePath}`],
      );

    return file.contentSha256;
  };

  const waitForMtimeResolution = () =>
    new Promise((resolve) => setTimeout(resolve, 20));

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

    await writeFile({ resourcePath, content: 'same' });
    const firstModifiedAt = statSync(getStoredFilePath(resourcePath)).mtimeMs;

    await waitForMtimeResolution();
    await writeFile({ resourcePath, content: 'same' });

    expect(statSync(getStoredFilePath(resourcePath)).mtimeMs).toBe(
      firstModifiedAt,
    );
    expect(await findRowContentSha256(resourcePath)).toBe(
      computeSha256('same'),
    );
  });

  it('overwrites the stored object when same-size content differs', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    await writeFile({ resourcePath, content: 'aaaa' });
    await writeFile({ resourcePath, content: 'bbbb' });

    expect(readFileSync(getStoredFilePath(resourcePath), 'utf-8')).toBe('bbbb');
    expect(await findRowContentSha256(resourcePath)).toBe(
      computeSha256('bbbb'),
    );
  });

  it('writes identical content again when the stored object is gone but its row remains', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    await writeFile({ resourcePath, content: 'same' });
    rmSync(getStoredFilePath(resourcePath));

    await writeFile({ resourcePath, content: 'same' });

    expect(readFileSync(getStoredFilePath(resourcePath), 'utf-8')).toBe('same');
  });

  it('hashes the sanitized bytes so resending the same unsafe svg is skipped', async () => {
    const resourcePath = `unchanged-content/${v4()}.svg`;
    const unsafeSvg =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect width="1" height="1"/></svg>';

    await writeFile({ resourcePath, content: unsafeSvg });
    const storedSvg = readFileSync(getStoredFilePath(resourcePath));
    const firstModifiedAt = statSync(getStoredFilePath(resourcePath)).mtimeMs;

    await waitForMtimeResolution();
    await writeFile({ resourcePath, content: unsafeSvg });

    expect(storedSvg.toString('utf-8')).not.toContain('<script>');
    expect(await findRowContentSha256(resourcePath)).toBe(
      computeSha256(storedSvg),
    );
    expect(statSync(getStoredFilePath(resourcePath)).mtimeMs).toBe(
      firstModifiedAt,
    );
  });

  it('rewrites the original content after a direct upload replaced the stored object', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    await writeFile({ resourcePath, content: 'aaaa' });

    const pendingFile = await fileStorageService.createPendingFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FILE_FOLDER,
      resourcePath,
      fileId: v4(),
      size: 4,
      mimeType: 'application/octet-stream',
      settings: FILE_SETTINGS,
    });

    const pendingResourcePath = buildPendingUploadResourcePath({
      fileId: pendingFile.id,
      resourcePath,
    });

    mkdirSync(dirname(getStoredFilePath(pendingResourcePath)), {
      recursive: true,
    });
    writeFileSync(getStoredFilePath(pendingResourcePath), 'bbbb');

    const storageLocation = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FILE_FOLDER,
    };

    await fileStorageService.promotePendingFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      file: pendingFile,
      from: { ...storageLocation, resourcePath: pendingResourcePath },
      to: { ...storageLocation, resourcePath },
      size: 4,
      mimeType: 'text/plain',
    });

    expect(readFileSync(getStoredFilePath(resourcePath), 'utf-8')).toBe('bbbb');

    await writeFile({ resourcePath, content: 'aaaa' });

    expect(readFileSync(getStoredFilePath(resourcePath), 'utf-8')).toBe('aaaa');
  });

  it('keeps the row hash in step with the stored bytes when writes race on one path', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    await Promise.all(
      ['aaaa', 'bbbb', 'cccc', 'dddd', 'eeee'].map((content) =>
        writeFile({ resourcePath, content }),
      ),
    );

    expect(await findRowContentSha256(resourcePath)).toBe(
      computeSha256(readFileSync(getStoredFilePath(resourcePath))),
    );
  });

  it('rewrites the original content after transactional writes were rolled back', async () => {
    const resourcePath = `unchanged-content/${v4()}.txt`;

    await writeFile({ resourcePath, content: 'aaaa' });

    const queryRunner =
      getAppProviderByClassName<DataSource>('DataSource').createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await writeFile({ resourcePath, content: 'aaaa', queryRunner });
      await writeFile({ resourcePath, content: 'bbbb', queryRunner });
    } finally {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }

    await writeFile({ resourcePath, content: 'aaaa' });

    expect(readFileSync(getStoredFilePath(resourcePath), 'utf-8')).toBe('aaaa');
  });
});
