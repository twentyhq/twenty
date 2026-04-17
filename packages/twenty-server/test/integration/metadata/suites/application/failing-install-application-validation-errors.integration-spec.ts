import crypto from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import * as tar from 'tar';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { type DataSource } from 'typeorm';

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

const buildManifestWithInvalidNavigationMenuItem = (
  universalIdentifier: string,
  roleUniversalIdentifier: string,
) =>
  JSON.stringify({
    application: {
      universalIdentifier,
      displayName: 'Test App With Invalid Manifest',
      description: 'A test app with an invalid navigation menu item',
      icon: 'IconTestPipe',
      defaultRoleUniversalIdentifier: roleUniversalIdentifier,
      applicationVariables: {},
      packageJsonChecksum: null,
      yarnLockChecksum: null,
    },
    roles: [
      {
        universalIdentifier: roleUniversalIdentifier,
        label: 'Test Role',
        description: 'Test role',
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
    navigationMenuItems: [
      {
        universalIdentifier: crypto.randomUUID(),
        position: 0,
        type: 'OBJECT',
        targetObjectUniversalIdentifier: crypto.randomUUID(),
      },
    ],
    pageLayouts: [],
  });

describe('Install application should return structured validation errors', () => {
  let ds: DataSource;
  const createdRegistrationIds: string[] = [];
  const createdApplicationUniversalIdentifiers: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
    ds = globalThis.testDataSource;
  });

  afterAll(async () => {
    for (const uid of createdApplicationUniversalIdentifiers) {
      await ds.query(
        `DELETE FROM core."file" WHERE "applicationId" IN (
          SELECT id FROM core."application" WHERE "universalIdentifier" = $1
        )`,
        [uid],
      );

      await ds.query(
        `DELETE FROM core."application" WHERE "universalIdentifier" = $1`,
        [uid],
      );
    }

    for (const id of createdRegistrationIds) {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [id],
      );
    }

    jest.useFakeTimers();
  });

  it('should return METADATA_VALIDATION_FAILED with structured errors when installing an app with an invalid manifest', async () => {
    const universalIdentifier = crypto.randomUUID();
    const roleUniversalIdentifier = crypto.randomUUID();
    const manifest = buildManifestWithInvalidNavigationMenuItem(
      universalIdentifier,
      roleUniversalIdentifier,
    );

    const tarball = await createTestTarball({
      'manifest.json': manifest,
      'package.json': JSON.stringify({
        name: 'test-invalid-manifest-app',
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

    createdRegistrationIds.push(registrationId);
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
