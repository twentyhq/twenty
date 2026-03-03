import crypto from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import request from 'supertest';
import * as tar from 'tar';
import { type DataSource } from 'typeorm';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

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

const createValidManifest = (universalIdentifier: string) =>
  JSON.stringify({
    application: {
      universalIdentifier,
      displayName: 'Test Tarball App',
      description: 'A test app',
      icon: 'IconTestPipe',
      defaultRoleUniversalIdentifier: crypto.randomUUID(),
      applicationVariables: {},
      packageJsonChecksum: null,
      yarnLockChecksum: null,
      apiClientChecksum: null,
    },
    roles: [],
    skills: [],
    objects: [],
    fields: [],
    logicFunctions: [],
    frontComponents: [],
    publicAssets: [],
    views: [],
    navigationMenuItems: [],
    pageLayouts: [],
  });

const insertRegistrationWithSource = async (
  ds: DataSource,
  params: {
    universalIdentifier: string;
    name: string;
    sourceType: 'npm' | 'tarball' | 'none';
    sourcePackage?: string;
  },
): Promise<string> => {
  const id = crypto.randomUUID();
  const oAuthClientId = crypto.randomUUID();

  await ds.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId",
       "oAuthRedirectUris", "oAuthScopes", "workspaceId",
       "sourceType", "sourcePackage")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      params.universalIdentifier,
      params.name,
      oAuthClientId,
      [],
      [],
      TEST_WORKSPACE_ID,
      params.sourceType,
      params.sourcePackage ?? null,
    ],
  );

  return id;
};

describe('App Distribution (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;
  const createdRegistrationIds: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
    ds = global.testDataSource;
  });

  afterAll(async () => {
    for (const id of createdRegistrationIds) {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [id],
      );
    }
    jest.useFakeTimers();
  });

  const postUploadTarball = (body: Record<string, unknown>) =>
    request(baseUrl)
      .post('/api/app-registrations/upload-tarball')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(body);

  describe('Upload tarball endpoint', () => {
    it('should reject request without tarball data', async () => {
      const res = await postUploadTarball({}).expect(400);

      expect(res.body.messages[0]).toContain('Tarball data is required');
    });

    it('should reject tarball that exceeds size limit', async () => {
      const largeFakeBase64 = Buffer.alloc(51 * 1024 * 1024).toString('base64');

      const res = await postUploadTarball({
        tarball: largeFakeBase64,
      });

      expect([400, 413]).toContain(res.status);
    });

    it('should reject tarball without manifest.json', async () => {
      const tarball = await createTestTarball({
        'readme.txt': 'no manifest here',
      });

      const res = await postUploadTarball({
        tarball: tarball.toString('base64'),
      }).expect(400);

      expect(res.body.messages[0]).toContain('manifest.json');
    });

    it('should successfully upload a valid tarball and create registration', async () => {
      const uid = crypto.randomUUID();
      const manifest = createValidManifest(uid);

      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const res = await postUploadTarball({
        tarball: tarball.toString('base64'),
        universalIdentifier: uid,
      }).expect(200);

      expect(res.body.id).toBeDefined();
      expect(res.body.universalIdentifier).toBe(uid);
      createdRegistrationIds.push(res.body.id);

      const rows = await ds.query(
        `SELECT "sourceType" FROM core."applicationRegistration"
         WHERE id = $1`,
        [res.body.id],
      );

      expect(rows[0].sourceType).toBe('tarball');
    });

    it('should update existing tarball registration on re-upload', async () => {
      const uid = crypto.randomUUID();
      const manifest = createValidManifest(uid);

      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const firstRes = await postUploadTarball({
        tarball: tarball.toString('base64'),
        universalIdentifier: uid,
      }).expect(200);

      createdRegistrationIds.push(firstRes.body.id);

      const secondRes = await postUploadTarball({
        tarball: tarball.toString('base64'),
        universalIdentifier: uid,
      }).expect(200);

      expect(secondRes.body.id).toBe(firstRes.body.id);
    });
  });

  describe('Source channel enforcement', () => {
    it('should reject tarball upload for npm-sourced registration', async () => {
      const uid = crypto.randomUUID();

      const regId = await insertRegistrationWithSource(ds, {
        universalIdentifier: uid,
        name: 'NPM App',
        sourceType: 'npm',
        sourcePackage: '@test/npm-app',
      });

      createdRegistrationIds.push(regId);

      const manifest = createValidManifest(uid);
      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const res = await postUploadTarball({
        tarball: tarball.toString('base64'),
        universalIdentifier: uid,
      }).expect(400);

      expect(res.body.messages[0]).toContain('registered as npm');
    });

    it('should allow tarball upload for none-sourced registration', async () => {
      const uid = crypto.randomUUID();

      const regId = await insertRegistrationWithSource(ds, {
        universalIdentifier: uid,
        name: 'None Source App',
        sourceType: 'none',
      });

      createdRegistrationIds.push(regId);

      const manifest = createValidManifest(uid);
      const tarball = await createTestTarball({
        'manifest.json': manifest,
        'package.json': JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
        }),
      });

      const res = await postUploadTarball({
        tarball: tarball.toString('base64'),
        universalIdentifier: uid,
      }).expect(200);

      expect(res.body.id).toBe(regId);

      const rows = await ds.query(
        `SELECT "sourceType" FROM core."applicationRegistration"
         WHERE id = $1`,
        [regId],
      );

      expect(rows[0].sourceType).toBe('tarball');
    });
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      await request(baseUrl)
        .post('/api/app-registrations/upload-tarball')
        .send({ tarball: 'dGVzdA==' })
        .expect(403);
    });
  });
});
