import crypto from 'crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';

import { type ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { type DataSource } from 'typeorm';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.setTimeout(120000);

const PUBLISHED_VERSIONS = ['1.0.0', '1.1.0+build.7'] as const;
const LATEST_PUBLISHED_VERSION =
  PUBLISHED_VERSIONS[PUBLISHED_VERSIONS.length - 1];
const PUBLISHED_VERSIONS_NEWEST_FIRST = [...PUBLISHED_VERSIONS].reverse();

describe('Application registration versions', () => {
  const universalIdentifier = crypto.randomUUID();
  const roleUniversalIdentifier = crypto.randomUUID();
  const tarballByVersion: Record<string, Buffer> = {};

  let ds: DataSource;
  let applicationRegistrationId: string;

  const buildTarball = (version: string): Promise<Buffer> =>
    createAppTarball({
      'manifest.json': JSON.stringify(
        buildBaseManifest({
          appId: universalIdentifier,
          roleId: roleUniversalIdentifier,
        }),
      ),
      'package.json': JSON.stringify({
        name: 'test-registration-versions',
        version,
      }),
    });

  const findVersions = (): Promise<ApplicationRegistrationVersionEntity[]> =>
    ds.query(
      `SELECT * FROM core."applicationRegistrationVersion"
       WHERE "applicationRegistrationId" = $1
       ORDER BY "publishedAt" DESC, "createdAt" DESC`,
      [applicationRegistrationId],
    );

  beforeAll(async () => {
    jest.useRealTimers();
    ds = global.testDataSource;

    for (const version of PUBLISHED_VERSIONS) {
      tarballByVersion[version] = await buildTarball(version);

      const { data, errors } = await uploadAppTarball({
        tarballBuffer: tarballByVersion[version],
        universalIdentifier,
      });

      expect(errors).toBeUndefined();

      applicationRegistrationId = data.uploadAppTarball.id;
    }
  });

  afterAll(async () => {
    await ds.query(
      `DELETE FROM core."file" WHERE id IN (
        SELECT "tarballFileId" FROM core."applicationRegistrationVersion"
        WHERE "applicationRegistrationId" = $1
      )`,
      [applicationRegistrationId],
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: universalIdentifier,
    });

    jest.useFakeTimers();
  });

  it('records one version per publish with its stored artifact', async () => {
    const versions = await findVersions();

    expect(versions.map(({ version }) => version)).toEqual(
      PUBLISHED_VERSIONS_NEWEST_FIRST,
    );

    for (const version of versions) {
      expect(version).toMatchObject({
        applicationRegistrationId,
        sourceType: 'tarball',
        sourcePackage: null,
        tarballUrl: null,
      });
      expect(version.tarballFileId).toEqual(expect.any(String));
    }

    expect(
      new Set(versions.map(({ tarballFileId }) => tarballFileId)).size,
    ).toBe(PUBLISHED_VERSIONS.length);
  });

  it('keeps every published artifact in storage', async () => {
    const versions = await findVersions();

    const files = await ds.query(
      `SELECT id, status FROM core."file" WHERE id = ANY($1)`,
      [versions.map(({ tarballFileId }) => tarballFileId)],
    );

    expect(files).toHaveLength(PUBLISHED_VERSIONS.length);
    expect(
      files.every(({ status }: { status: string }) => status === 'UPLOADED'),
    ).toBe(true);
  });

  it('finds the published version through the installed registration and version', async () => {
    const { errors } = await installApplication({
      input: { universalIdentifier },
    });

    expect(errors).toBeUndefined();

    const latestVersion = (await findVersions()).find(
      ({ version }) => version === LATEST_PUBLISHED_VERSION,
    );

    const [application] = await ds.query(
      `SELECT application.version, version.id AS "publishedVersionId"
       FROM core.application AS application
       JOIN core."applicationRegistrationVersion" AS version
         ON version."applicationRegistrationId" = application."applicationRegistrationId"
        AND version.version = application.version
       WHERE application."universalIdentifier" = $1 AND application."workspaceId" = $2`,
      [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

    expect(application).toEqual({
      version: LATEST_PUBLISHED_VERSION,
      publishedVersionId: latestVersion?.id,
    });
  });

  it('refuses an npm version recorded without its package name', async () => {
    await expect(
      ds.query(
        `INSERT INTO core."applicationRegistrationVersion"
           ("applicationRegistrationId", version, "sourceType")
         VALUES ($1, '2.0.0', 'npm')`,
        [applicationRegistrationId],
      ),
    ).rejects.toThrow('CHK_APP_REG_VERSION_NPM_HAS_SOURCE_PACKAGE');
  });

  it('deletes retained tarballs from their original workspace after an ownership transfer', async () => {
    const tarballFileIds = (await findVersions()).map(
      ({ tarballFileId }) => tarballFileId,
    );

    await ds.query(
      'UPDATE core."applicationRegistration" SET "workspaceId" = $1 WHERE id = $2',
      [SEED_YCOMBINATOR_WORKSPACE_ID, applicationRegistrationId],
    );

    const deleted =
      await getAppProviderByClassName<ApplicationRegistrationService>(
        'ApplicationRegistrationService',
      ).delete({
        applicationRegistrationId,
        ownerWorkspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      });

    expect(deleted).toBe(true);

    const remainingFiles = await ds.query(
      `SELECT id FROM core."file" WHERE id = ANY($1)`,
      [tarballFileIds],
    );
    const remainingVersions = await ds.query(
      `SELECT id FROM core."applicationRegistrationVersion"
       WHERE "applicationRegistrationId" = $1`,
      [applicationRegistrationId],
    );

    expect(remainingFiles).toEqual([]);
    expect(remainingVersions).toEqual([]);
  });
});
