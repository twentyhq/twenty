import crypto from 'crypto';

import gql from 'graphql-tag';
import {
  type ApplicationRegistrationVersionResult,
  findApplicationRegistrationVersions,
} from 'test/integration/metadata/suites/application-registration/utils/find-application-registration-versions.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { type DataSource } from 'typeorm';

import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The upload flow runs cache-lock retries with real delays, so fake timers
// would hang it.
jest.setTimeout(120000);

const PUBLISHED_VERSIONS = ['1.0.0', '1.1.0'] as const;

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

  const findVersions = async (): Promise<
    ApplicationRegistrationVersionResult[]
  > => {
    const { data, errors } = await findApplicationRegistrationVersions({
      input: { applicationRegistrationId },
    });

    expect(errors).toBeUndefined();

    return data.findApplicationRegistrationVersions;
  };

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
    // Tarballs belong to the publishing workspace, not to the installed
    // application, so the shared cleanup does not reach their file rows.
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

    expect(versions.map(({ version }) => version)).toEqual(['1.1.0', '1.0.0']);

    for (const version of versions) {
      expect(version).toMatchObject({
        applicationRegistrationId,
        sourceType: 'tarball',
        sourcePackage: null,
        artifactUrl: null,
        checksum: computeSriIntegrity(tarballByVersion[version.version]),
        publishedByUserId: expect.any(String),
        publishedByWorkspaceId: SEED_APPLE_WORKSPACE_ID,
        reviewState: 'UNREVIEWED',
      });
      expect(version.tarballFileId).toEqual(expect.any(String));
      expect(version.artifactDownloadUrl).toContain(version.tarballFileId);
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
      ({ version }) => version === '1.1.0',
    );

    const [application] = await ds.query(
      `SELECT version, "applicationRegistrationVersionId"
       FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
    );

    expect(application).toEqual({
      version: '1.1.0',
      applicationRegistrationVersionId: latestVersion?.id,
    });
  });

  it('exposes the versions and their artifacts to admins', async () => {
    const response = await makeAdminPanelApiRequest({
      query: gql`
        query FindAdminApplicationRegistrationVersions(
          $applicationRegistrationId: String!
        ) {
          findAdminApplicationRegistrationVersions(
            applicationRegistrationId: $applicationRegistrationId
          ) {
            id
            version
            checksum
            tarballFileId
            artifactDownloadUrl
            reviewState
          }
        }
      `,
      variables: { applicationRegistrationId },
    });

    expect(response.body.errors).toBeUndefined();

    const versions =
      response.body.data.findAdminApplicationRegistrationVersions;

    expect(versions.map(({ version }: { version: string }) => version)).toEqual(
      ['1.1.0', '1.0.0'],
    );

    for (const version of versions) {
      expect(version.artifactDownloadUrl).toContain(version.tarballFileId);
    }
  });

  it('refuses the versions of a registration owned by another workspace', async () => {
    const otherWorkspaceRegistrationId =
      await insertCatalogApplicationRegistration({
        universalIdentifier: crypto.randomUUID(),
        name: 'Other Workspace App',
        sourcePackage: '@test/other-workspace-app',
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      });

    try {
      const { data, errors } = await findApplicationRegistrationVersions({
        input: { applicationRegistrationId: otherWorkspaceRegistrationId },
        expectToFail: true,
      });

      expect(data).toBeNull();
      expect(errors).toBeDefined();
    } finally {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [otherWorkspaceRegistrationId],
      );
    }
  });
});
