import crypto from 'crypto';

import gql from 'graphql-tag';
import {
  type ApplicationRegistrationVersionResult,
  findAdminApplicationRegistrationVersions,
} from 'test/integration/metadata/suites/application-registration/utils/find-admin-application-registration-versions.util';
import { deleteApplicationRegistration } from 'test/integration/metadata/suites/application-registration/utils/delete-application-registration.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type DataSource } from 'typeorm';

import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

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

  const findVersions = (): Promise<ApplicationRegistrationVersionResult[]> =>
    findAdminApplicationRegistrationVersions(applicationRegistrationId);

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

  it('records one version per publish with its artifact, fingerprint and publisher', async () => {
    const versions = await findVersions();

    expect(versions.map(({ version }) => version)).toEqual(
      PUBLISHED_VERSIONS_NEWEST_FIRST,
    );

    for (const version of versions) {
      expect(version).toMatchObject({
        applicationRegistrationId,
        sourceType: 'TARBALL',
        sourcePackage: null,
        tarballUrl: null,
        checksum: computeSriIntegrity({
          source: tarballByVersion[version.version],
        }),
        publishedByUserId: expect.any(String),
        publishedByWorkspaceId: SEED_APPLE_WORKSPACE_ID,
        reviewState: 'UNREVIEWED',
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

  it('links the installed application to the version it was resolved from', async () => {
    const { errors } = await installApplication({
      input: { universalIdentifier },
    });

    expect(errors).toBeUndefined();

    const latestVersion = (await findVersions()).find(
      ({ version }) => version === LATEST_PUBLISHED_VERSION,
    );

    const [application] = await ds.query(
      `SELECT version, "applicationRegistrationVersionId"
       FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

    expect(application).toEqual({
      version: LATEST_PUBLISHED_VERSION,
      applicationRegistrationVersionId: latestVersion?.id,
    });

    const response = await makeMetadataApiRequest({
      query: gql`
        query CurrentWorkspaceInstalledApplications {
          currentWorkspace {
            installedApplications {
              universalIdentifier
              applicationRegistrationVersionId
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.currentWorkspace.installedApplications,
    ).toContainEqual({
      universalIdentifier,
      applicationRegistrationVersionId: latestVersion?.id,
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

  it('deletes every retained tarball with the registration', async () => {
    const tarballFileIds = (await findVersions()).map(
      ({ tarballFileId }) => tarballFileId,
    );

    const { data, errors } = await deleteApplicationRegistration({
      input: { id: applicationRegistrationId },
    });

    expect(errors).toBeUndefined();
    expect(data.deleteApplicationRegistration).toBe(true);

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
