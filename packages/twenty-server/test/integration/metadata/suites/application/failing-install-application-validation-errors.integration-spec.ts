import crypto from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import * as tar from 'tar';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const createTestTarball = async (
  files: Record<string, string>,
): Promise<Buffer> => {
  const tempId = crypto.randomUUID();
  const sourceDir = join(tmpdir(), `test-tarball-src-${tempId}`);
  const tarballPath = join(tmpdir(), `test-tarball-${tempId}.tar.gz`);

  await fs.mkdir(sourceDir, { recursive: true });

  for (const [name, content] of Object.entries(files)) {
    const filePath = join(sourceDir, name);
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));

    if (dir !== sourceDir) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(filePath, content);
  }

  await tar.create(
    {
      file: tarballPath,
      gzip: true,
      cwd: sourceDir,
    },
    Object.keys(files),
  );

  const buffer = await fs.readFile(tarballPath);

  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(tarballPath, { force: true });

  return buffer;
};

const buildManifestWithCrossEntityIdentifierConflict = (
  universalIdentifier: string,
  roleUniversalIdentifier: string,
  duplicatedUniversalIdentifier: string,
) =>
  JSON.stringify({
    application: {
      universalIdentifier,
      displayName: 'Test App With Cross Entity Identifier Conflict',
      description:
        'A test app whose manifest reuses a universalIdentifier across entity types',
      icon: 'IconTestPipe',
      defaultRoleUniversalIdentifier: roleUniversalIdentifier,
      applicationVariables: {},
      packageJsonChecksum: null,
      yarnLockChecksum: null,
    },
    roles: [
      {
        universalIdentifier: roleUniversalIdentifier,
        label: 'First Role',
        description: 'First role',
      },
      {
        universalIdentifier: duplicatedUniversalIdentifier,
        label: 'Second Role',
        description: 'Second role',
        objectPermissions: [
          {
            universalIdentifier: duplicatedUniversalIdentifier,
            objectUniversalIdentifier:
              STANDARD_OBJECTS.company.universalIdentifier,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    ],
    skills: [],
    agents: [],
    objects: [],
    fields: [],
    logicFunctions: [],
    frontComponents: [],
    publicAssets: [],
    views: [],
    navigationMenuItems: [],
    pageLayouts: [],
  });

describe('Install application should return structured validation errors', () => {
  const createdApplicationUniversalIdentifiers: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    for (const uid of createdApplicationUniversalIdentifiers) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: uid,
      });
    }

    jest.useFakeTimers();
  });

  it('should return METADATA_VALIDATION_FAILED with structured errors when installing an app whose manifest has validation errors', async () => {
    const universalIdentifier = crypto.randomUUID();
    const roleUniversalIdentifier = crypto.randomUUID();
    const duplicatedUniversalIdentifier = crypto.randomUUID();
    const manifest = buildManifestWithCrossEntityIdentifierConflict(
      universalIdentifier,
      roleUniversalIdentifier,
      duplicatedUniversalIdentifier,
    );

    const tarball = await createTestTarball({
      'manifest.json': manifest,
      'package.json': JSON.stringify({
        name: 'test-cross-entity-identifier-conflict-app',
        version: '1.0.0',
      }),
    });

    const uploadResult = await uploadAppTarball({
      tarballBuffer: tarball,
      universalIdentifier,
    });

    expect(uploadResult.errors).toBeUndefined();
    expect(uploadResult.data?.uploadAppTarball.id).toBeDefined();

    const registrationId = uploadResult.data!.uploadAppTarball.id;

    createdApplicationUniversalIdentifiers.push(universalIdentifier);

    const { errors } = await installApplication({
      input: {
        appRegistrationId: registrationId,
      },
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);

    const [error] = errors;

    expect(error.extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(error.extensions.errors).toBeDefined();
    expect(error.extensions.summary).toBeDefined();
    expect(error.extensions.summary.totalErrors).toBeGreaterThan(0);
    expect(error.extensions.message).toMatch(/Validation failed for/);
  }, 120000);
});
